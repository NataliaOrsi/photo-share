import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { client } from "../client";
import MasonryLayout from "./MasonryLayout";
import Spinner from "./Spinner";
import { feedQuery, searchQuery } from "../utils/data";

const Feed = () => {
  const [loading, setLoading] = useState(false);
  const [pins, setPins] = useState(null);
  const { categoryId } = useParams();

  useEffect(() => {
    setLoading(true);

    const fetchData = async () => {
      try {
        let query = feedQuery;
        if (categoryId) {
          query = searchQuery(categoryId);
        }
        const data = await client.fetch(query);
        setPins(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  if (loading) {
    return (
      <Spinner
        message={
          categoryId ? "Loading pins..." : "Adding new ideas to your feed..."
        }
      />
    );
  }

  if (!pins?.length) {
    return <h2>No pins available</h2>;
  }

  return <MasonryLayout pins={pins} />;
};

export default Feed;