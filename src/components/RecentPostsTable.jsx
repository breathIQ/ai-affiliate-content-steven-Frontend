import React from "react";

const statusStyles = {
  Published: "bg-green-100 text-green-700",
  Scheduled: "bg-blue-100 text-blue-700",
  "Saved in Draft": "bg-yellow-100 text-yellow-700",
};

const aiIcons = {
  openai: "🌀",
  sun: "✴️",
};

const posts = [
  {
    id: 1,
    image: "/icons/insta.svg",
    post: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna.",
    chapter: "Ch-12",
    hashtags: 12,
    ai: "sun",
    status: "Scheduled",
  },
  {
    id: 2,
    image: "/icons/insta.svg",
    post: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna.",
    chapter: "Ch-33",
    hashtags: 8,
    ai: "sun",
    status: "Published",
  },
  {
    id: 3,
    image: "/icons/insta.svg",
    post: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna.",
    chapter: "Ch-16",
    hashtags: 4,
    ai: "openai",
    status: "Published",
  },
];

export default function RecentPostsTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-3">
        <h2 className="font-semibold text-gray-800">Recent Posts</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="p-3 text-left">
                <input type="checkbox" />
              </th>
              <th className="p-3 text-left">Media</th>
              <th className="p-3 text-left">Post</th>
              <th className="p-3 text-left">Chapter</th>
              <th className="p-3 text-left">Hashtags</th>
              <th className="p-3 text-left">AI</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {posts.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <input type="checkbox" />
                </td>

                <td className="p-3">
                  <img
                    src={item.image}
                    alt=""
                    className="w-10 h-10 rounded-md object-cover"
                  />
                </td>

                <td className="p-3 max-w-md">
                  <p className="text-gray-700 line-clamp-2">
                    {item.post}
                  </p>
                </td>

                <td className="p-3 text-gray-600">{item.chapter}</td>

                <td className="p-3 text-gray-600">{item.hashtags}</td>

                <td className="p-3 text-lg">{aiIcons[item.ai]}</td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[item.status]}`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="p-3 text-right">
                  <button className="text-gray-400 hover:text-gray-600">
                    ⋯
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile hint */}
      <div className="p-3 text-xs text-gray-400 sm:hidden">
        Scroll horizontally →
      </div>
    </div>
  );
}
