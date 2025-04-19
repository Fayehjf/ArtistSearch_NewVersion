const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const authenticateUser = require("../utils/authMiddleware");
const axios = require("axios");
const { cookieOptions } = require("../utils/config");
const artsyRoutes = require("./artsy");


const formatResponse = (success, data, message = "") => ({
    success,
    ...(success ? { data } : { error: data }),
    message,
    timestamp: new Date().toISOString()
});
router.post("/register", async (req, res) => { try { const { fullname, email, password } = req.body;

        if (!fullname?.trim() || !email?.trim() || !password) {
            return res.status(400).json(
                formatResponse(false, {
                    code: "MISSING_FIELDS",
                    fieldErrors: { 
                      ...(!fullname?.trim() && { fullname: "Full name is required" }),
                      ...(!email?.trim() && { email: "Email is required" }),
                      ...(!password && { password: "Password is required" })
                    }
                  }, "All fields are required")
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json(
                formatResponse(false, 
                    { code: "INVALID_EMAIL", field: "email" },
                    "Invalid email format"
                )
            );
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json(
                formatResponse(false, 
                { code: "EMAIL_EXISTS", field: "email" },
                "Email already registered"
                )
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const gravatarHash = crypto
            .createHash('md5')
            .update(email.trim().toLowerCase())
            .digest('hex');
        const profileImageUrl = `https://www.gravatar.com/avatar/${gravatarHash}?d=identicon`;

        const user = new User({
            fullname,
            email: email.toLowerCase(),
            password: hashedPassword,
            profileImageUrl,
            favorites: []
        });
        await user.save();

        const token = jwt.sign(
            { userId: user._id, email: user.email, profile: user.profileImageUrl}, 
            process.env.JWT_SECRET, 
            { expiresIn: "1h"}
        );

        res.cookie("token", token, cookieOptions)
            .status(201)
            .json(formatResponse(true, {
                user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                profileImageUrl: user.profileImageUrl
                }
            }, "Registration successful"));
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json(
        formatResponse(false, 
            { code: "SERVER_ERROR" },
            "Registration failed"
        )
        );
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json(
                formatResponse(false, 
                    { code: "MISSING_CREDENTIALS" },
                    "Email and password are required"
                )
            );
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json(
                formatResponse(false, 
                    { code: "INVALID_CREDENTIALS" },
                     "Invalid email or password"
                )
            );
        }

        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) {
            return res.status(401).json(
                formatResponse(false, 
                    { code: "INVALID_CREDENTIALS" },
                    "Invalid email or password"
                )
            );
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, profile: user.profileImageUrl}, 
            process.env.JWT_SECRET, 
            { expiresIn: "1h"}
        );

        res.cookie("token", token, cookieOptions)
            .json(formatResponse(true, {
                
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
                favorites: user.favorites
                
            }, "Login successful"));
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json(
            formatResponse(false, 
              { code: "SERVER_ERROR" },
              "Login failed"
            )
        );
    }
});

router.post("/logout", authenticateUser, (req, res) => {
    res.clearCookie("token", cookieOptions);
    res.json(formatResponse(true, null, "Logged out successfully"));
});

router.delete('/delete', authenticateUser, async (req, res) => {
    try {
        const deleteUser = await User.findByIdAndDelete(req.user.id);

        if(!deleteUser){
            return res.status(404).json(
                formatResponse(false, 
                    { code: "USER_NOT_FOUND" },
                    "User account not found"
                )
            );
        }

        res.clearCookie("token", cookieOptions)
        res.json(formatResponse(true, null, "Account deleted successfully"));
    } catch (error) {
        console.error("Delete account error:", error);
        res.status(500).json(
            formatResponse(false, 
                { code: "SERVER_ERROR" },
                "Account deletion failed"
            )
        );
    }
});

router.post("/favorites/add", authenticateUser, async (req, res) => {
    try {
      const { artistId } = req.body;
      if (!artistId) {
        return res.status(400).json(
          formatResponse(false, { code: "MISSING_ARTIST_ID" }, "Artist ID is required")
        );
      }
  
      // Retrieve token from artsyRoutes using the attached function.
      const token = await artsyRoutes.getXappToken();
  
      // Retrieve full artist data from the Artsy API.
      const artistRes = await axios.get(`https://api.artsy.net/api/artists/${artistId}`, {
        headers: { "X-XAPP-Token": token }
      });
  
      // Build a complete object from the Artsy response.
      const artistData = {
        artistId,
        name: artistRes.data.name,
        birthday: artistRes.data.birthday,
        deathday: artistRes.data.deathday,
        nationality: artistRes.data.nationality,
        // Use the thumbnail from Artsy, falling back to a default if missing.
        thumbnail: artistRes.data._links.thumbnail?.href || '/assets/artsy_logo.svg',
        addedAt: new Date()
      };
  
      // Load the user (using req.user.id as set by your authentication middleware)
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json(formatResponse(false, { code: "USER_NOT_FOUND" }, "User not found"));
      }
      
      // Check if a favorite with this artistId already exists.
      const index = user.favorites.findIndex(fav => fav.artistId === artistId);
      if (index !== -1) {
        // Update the existing favorite with the latest data.
        user.favorites[index] = artistData;
      } else {
        // Otherwise, add the new favorite.
        user.favorites.push(artistData);
      }
      
      // Save the user document so changes persist in MongoDB.
      await user.save();
  
      // Optionally, add a notification (this step can be adjusted as needed)
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          notifications: {
            type: "FAV_ADD",
            message: `Added ${artistData.name} to favorites`,
            timestamp: new Date()
          }
        }
      });
  
      res.json(formatResponse(true, {
        favorites: user.favorites.sort((a, b) => b.addedAt - a.addedAt)
      }, "Added to favorites"));
  
    } catch (error) {
      console.error("Add favorite error:", error);
      res.status(500).json(
        formatResponse(false, { code: "SERVER_ERROR" }, "Failed to add favorite")
      );
    }
  });

router.post("/favorites/remove", authenticateUser, async (req, res) => {
    try {
        const { artistId } = req.body;

        if (!artistId) {
            return res.status(400).json(
                formatResponse(false, 
                     { code: "MISSING_ARTIST_ID" },
                    "Artist ID is required"
                )
            );
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { favorites: { artistId } } },
            { new: true }
        );

        res.json(formatResponse(true, {
            favorites: user.favorites
        }, "Removed from favorites"));
    } catch (error) {
        console.error("Remove favorite error:", error);
        res.status(500).json(
            formatResponse(false, 
                { code: "SERVER_ERROR" },
                "Failed to remove favorite"
            )
        );
    }
});

router.get("/favorites", authenticateUser, async (req, res) => {
    try {
      const { page = 1, size = 10 } = req.query;
      const user = await User.findById(req.user.id).select("favorites").lean();
      const startIndex = (page - 1) * size;
      const paginatedFavorites = user.favorites
        .sort((a, b) => b.addedAt - a.addedAt)
        .slice(startIndex, startIndex + Number(size));
  
      res.json({
        success: true,
        data: {
          data: paginatedFavorites,
          total: user.favorites.length,
          page: Number(page),
          totalPages: Math.ceil(user.favorites.length / size)
        },
        message: "",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Get favorites error:", error);
      res.status(500).json(
        formatResponse(false, { code: "SERVER_ERROR" }, "Failed to fetch favorites")
      );
    }
  });

router.get("/me", authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password").lean();
        res.json(formatResponse(true, user));
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json(
            formatResponse(false, 
                { code: "SERVER_ERROR" },
                "Failed to fetch profile"
            )
        );
    }
});

module.exports = router;