const express = require("express");
const router = express.Router();
const axios = require("axios");

let xappToken = null;
let tokenExpiry = null;

const getXappToken = async () => {
    if (xappToken && Date.now() < tokenExpiry - 10000) return xappToken;

    try {
        const response = await axios.post(
        "https://api.artsy.net/api/tokens/xapp_token",
        {
            client_id: process.env.ARTSY_CLIENT_ID,
            client_secret: process.env.ARTSY_CLIENT_SECRET,
        }
        );
        xappToken = response.data.token;
        tokenExpiry = Date.now() + response.data.expires_in * 1000;
        return xappToken;
    } catch (error) {
        console.error("Failed to fetch Artsy token:", error.response?.data || error.message);
        throw new Error("Artsy authentication failed");
    }
};
router.getXappToken = getXappToken;

router.get("/search", async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: "Search query is required" });

        const token = await getXappToken();
        const encodedQuery = encodeURIComponent(q);
        const response = await axios.get("https://api.artsy.net/api/search", {
            params: {
                q: encodedQuery,
                type: "artist",
                size: 10,
            },
            headers: { "X-XAPP-Token": token },
            timeout: 10000,
        });

        const artists = response.data._embedded.results.map((artist) => ({
            id: artist._links.self.href.split("/").pop(),
            title: artist.title,
            _links: {
                thumbnail: {
                  href: artist._links.thumbnail?.href || 'assets/artsy_logo.svg'
                }
            }
        }));

        res.json({ artists });
    } catch (error) {
        if (error.response?.status === 404) {
            return res.status(404).json({ error: "No artists found" });
        }
        console.error("Search error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to search artists" });
    }
});

router.get("/artists/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const token = await getXappToken();
    const response = await axios.get(`https://api.artsy.net/api/artists/${id}`, {
      headers: { "X-XAPP-Token": token },
      timeout: 30000,
    });

    const artist = {
      id: response.data.id,
      name: response.data.name,
      birthday: response.data.birthday,
      deathday: response.data.deathday,
      nationality: response.data.nationality,
      biography: response.data.biography,
    };

    // Only fetch similar artists if the user is logged in (i.e. token exists in cookies)
    if (req.cookies && req.cookies.token) {
      const similarRes = await axios.get("https://api.artsy.net/api/artists", {
        params: { similar_to_artist_id: id, size: 6 },
        headers: { "X-XAPP-Token": token }
      });
      artist.similarArtists = similarRes.data._embedded.artists.map(a => ({
        id: a.id,
        name: a.name,
        thumbnail: a._links.thumbnail?.href || '/assets/artsy_logo.svg',
        nationality: a.nationality // (if available)
      }));
    } else {
      artist.similarArtists = []; // Return empty array if not logged in
    }

    res.json({ data: artist });
  } catch (err) {
    console.error("Artist details error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch artist details" });
  }
});
router.get("/artworks", async (req, res) => {
    try {
      const { artist_id, size = 10 } = req.query;
      if (!artist_id) return res.status(400).json({ error: "Artist ID required" });
      // if (artist_id.length !== 24) return res.status(400).json({ error: "Invalid Artist ID" });
  
      const token = await getXappToken();
      const response = await axios.get("https://api.artsy.net/api/artworks", {
        params: { 
          artist_id, 
          size 
        },
        headers: { "X-XAPP-Token": token }
      });
  
      const mappedArtworks = (response.data._embedded?.artworks || []).map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        date: artwork.date,
        _links: {
          thumbnail: {
            href: artwork._links.thumbnail?.href || ""
          }
        }
      }));

      res.json({
        _links: {
          self: { 
            href: `${req.protocol}://${req.get("host")}${req.originalUrl}`
          },
          next: response.data._links?.next || null
        },
        _embedded: {
          artworks: mappedArtworks
        }
      });
  
    } catch (error) {
      console.error("Artworks error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch artworks" });
    }
});

router.get("/similar-artists", async (req, res) => {
    try {
        const { artist_id } = req.query;
        if (!artist_id || artist_id.length !== 24) {
            return res.status(400).json({ error: "Valid Artist ID required" });
        }
    
        const token = await getXappToken();
        const response = await axios.get("https://api.artsy.net/api/artists", {
            params: { similar_to_artist_id: artist_id, size: 6 },
            headers: { "X-XAPP-Token": token }
        });
    
        const artists = response.data._embedded.artists.map(a => ({
            id: a.id,
            slug: a.slug,
            created_at: a.created_at,
            updated_at: a.updated_at,
            name: a.name,
            sortable_name: a.sortable_name,
            gender: a.gender,
            biography: a.biography,
            birthday: a.birthday,
            deathday: a.deathday,
            hometown: a.hometown,
            location: a.location,
            nationality: a.nationality,
            target_supply: a.target_supply,
            image_versions: a.image_versions,
      
        
            _links: {
              thumbnail: { href: a._links.thumbnail?.href },
              image: { 
                href: a._links.image?.href,
                templated: a._links.image?.templated 
              },
              self: { href: a._links.self?.href },
              permalink: { href: a._links.permalink?.href },
              artworks: { href: a._links.artworks?.href },
              published_artworks: { href: a._links.published_artworks?.href },
              similar_artists: { href: a._links.similar_artists?.href },
              similar_contemporary_artists: { 
                href: a._links.similar_contemporary_artists?.href 
              },
              genes: { href: a._links.genes?.href }
            }
        }));
  
        res.json({ _embedded: {
            artists: mappedArtists
          } });
    } catch (error) {
        console.error("Similar artists error:", error.response?.data || error.message);
         res.status(500).json({ error: "Failed to fetch similar artists" });
    }
});
module.exports = router;