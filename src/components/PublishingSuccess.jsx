export default function PublishingSuccess({ details }) {
  return (
    <div>
      <div className="bg-white rounded-xl shadow p-5 h-full">
        <h2 className="text-sm font-semibold text-gray-800 mb-6">
          Publishing Success Rate
        </h2>

        {/* Cards */}
        <div className="flex gap-6 py-5 mb-4">
          {/* Posts Published */}
          <div className="flex-1 border-2 border-dotted border-gray-200 rounded-xl py-[8px] px-[16px]">
            <p className="text-[22px] font-bold text-gray-900">
              {details?.publishing_stats?.published}
            </p>
            <p className="text-sm text-gray-500 mt-2">Posts Published</p>
          </div>

          {/* Posts Generated */}
          <div className="flex-1 border-2 border-dotted border-gray-200 rounded-xl py-[8px] px-[16px]">
            <p className="text-[22px] font-bold text-gray-900">
              {details?.publishing_stats?.generated}
            </p>
            <p className="text-sm text-gray-500 mt-2">Posts Generated</p>
          </div>
        </div>

        <div className="my-4">
          <p className="text-[16px] py-2 text-gray-500 mt-2">
            {details?.publishing_stats?.success_rate}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-[16px]">
            <div
              style={{
                width: `${details?.publishing_stats?.success_rate ?? 1}%`,
              }}
              className={`bg-purple-600 h-[16px] rounded-full w-[${
                details?.publishing_stats?.success_rate || 1
              }%]`}
            />
          </div>
        </div>
      </div>
      {/* <div className="bg-white rounded-xl shadow p-5 mt-4">
        <div className="">
          <p className="text-lg font-semibold">357</p>
          <p className="text-xs text-gray-500 mb-2">Affiliate Join Requests</p>

          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <img
                key={i}
                src={`https://i.pravatar.cc/32?img=${i + 20}`}
                alt=""
                className="w-8 h-8 rounded-full border-2 border-white"
              />
            ))}
            <span className="w-8 h-8 flex items-center justify-center text-xs bg-black text-white rounded-full">
              +52
            </span>
          </div>
        </div>
      </div> */}
    </div>
  );
}
