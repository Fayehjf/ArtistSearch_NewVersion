const express = require("express");
const router = express.Router();
const axios = require("axios");
const { getXappToken } = require("./artsy");

router.get("/", async (req, res) => {
  try {
    const { artwork_id } = req.query;
    if (!artwork_id) {
      return res.status(400).json({ error: "Artwork ID required" });
    }

    const token = await getXappToken();
    const response = await axios.get("https://api.artsy.net/api/genes", {
      params: { artwork_id },
      headers: { "X-XAPP-Token": token }
    });

    const genes = response.data._embedded.genes.map(g => ({
      name: g.name,
      thumbnail: g._links.thumbnail?.href
    }));

    res.json({
        data: {
            artworkTitle: response.data.title,
            categories: genes,
            artworkImage: response.data._links.thumbnail?.href
        }
    });

  } catch (error) {
    console.error("Genes error:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to fetch categories",
      details: error.response?.data?.message 
    });
  }
});

module.exports = router;