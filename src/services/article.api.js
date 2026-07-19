import API from "./api";

// Article campaigns: promoting one of Steven's published carbogenetics.com
// articles. Kept separate from campaign.api.js for the same reason the backend
// keeps ArticlePostGenerationController separate from the product one - the two
// have different compliance models and shouldn't drift into each other.

// Every live article, newest first, each with this affiliate's own share link.
export const getArticles = async () => {
  const res = await API.get("/user/articles");
  return res.data;
};

// Draft step: post text, plus the spoken script when post_type is "video".
// Free - nothing is charged and nothing is saved.
export const draftArticleText = async (data) => {
  const res = await API.post("/user/articles/generate", { ...data, draft_only: true });
  return res.data;
};

// Final: generates the slides or kicks off the video render, and creates the
// draft Post server-side with the compliance data and share link stamped on.
export const generateArticlePost = async (data) => {
  const res = await API.post("/user/articles/generate", data);
  return res.data;
};
