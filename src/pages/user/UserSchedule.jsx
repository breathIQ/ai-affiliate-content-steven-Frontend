import { useState } from "react";
import GenerateContentModal from "../../components/modals/GenerateContentModal";
import Layout from "../../components/Layout/Layout";

const views = ["Month", "Week", "Day", "List"];

const eventsData = {
  "2025-12-01": [
    { title: "Post", type: "published" },
    { title: "Post", type: "published" },
    { title: "+5 more", type: "more" },
  ],
  "2025-12-02": [{ title: "Post", type: "published" }],
  "2025-12-09": [{ title: "Post", type: "published" }],
  "2025-12-13": [{ title: "Post", type: "published" }],
  "2025-12-15": [
    { title: "Post", type: "published" },
    { title: "Post", type: "published" },
    { title: "+5 more", type: "more" },
  ],
  "2025-12-23": [{ title: "Post", type: "scheduled" }],
  "2025-12-28": [
    { title: "Post", type: "scheduled" },
    { title: "Post", type: "scheduled" },
    { title: "+5 more", type: "more" },
  ],
};

const eventColors = {
  published: "bg-emerald-500",
  scheduled: "bg-blue-500",
  draft: "bg-gray-400",
  more: "text-emerald-500 text-xs",
};

export default function UserSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("Month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days = [];

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  for (let d = 1; d <= totalDays; d++) {
    days.push(new Date(year, month, d));
  }

  const formatKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;

  const isToday = (date) =>
    date && date.toDateString() === new Date().toDateString();

  const renderMonthView = () => (
    <>
      {/* WEEK DAYS */}
      <div className="grid grid-cols-7 text-xs text-gray-500 border-t border-l">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="p-2 border-r border-b text-center font-medium"
          >
            {d}
          </div>
        ))}
      </div>

      {/* DAYS GRID */}
      <div className="grid grid-cols-7 border-l border-b">
        {days.map((date, i) => (
          <div
            key={i}
            className="min-h-[110px] p-2 border-r border-t text-xs relative"
          >
            {date && (
              <>
                <span
                  className={`absolute top-2 right-2 ${
                    isToday(date)
                      ? "bg-gray-900 text-white px-2 rounded-full"
                      : "text-gray-700"
                  }`}
                >
                  {date.getDate()}
                </span>

                <div className="mt-6 space-y-1">
                  {(eventsData[formatKey(date)] || []).map((event, idx) =>
                    event.type === "more" ? (
                      <div key={idx} className={eventColors.more}>
                        {event.title}
                      </div>
                    ) : (
                      <div
                        key={idx}
                        className={`${
                          eventColors[event.type]
                        } text-white px-2 py-0.5 rounded`}
                      >
                        {event.title}
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const renderWeekView = () => (
    <div className="grid grid-cols-7 gap-2">
      {[...Array(7)].map((_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);

        return (
          <div key={i} className="border rounded-lg p-2 min-h-[150px]">
            <div className="font-medium text-sm mb-2">
              {date.toDateString()}
            </div>

            {(eventsData[formatKey(date)] || []).map((event, idx) => (
              <div
                key={idx}
                className={`${
                  eventColors[event.type]
                } text-white px-2 py-1 rounded mb-1 text-xs`}
              >
                {event.title}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
  const renderDayView = () => (
    <div className="border rounded-lg p-4">
      <h4 className="font-semibold mb-3">{currentDate.toDateString()}</h4>

      {(eventsData[formatKey(currentDate)] || []).map((event, idx) => (
        <div
          key={idx}
          className={`${
            eventColors[event.type]
          } text-white px-3 py-2 rounded mb-2`}
        >
          {event.title}
        </div>
      ))}

      {(eventsData[formatKey(currentDate)] || []).length === 0 && (
        <p className="text-sm text-gray-400">No events</p>
      )}
    </div>
  );
  const renderListView = () => (
    <div className="space-y-3">
      {Object.entries(eventsData).map(([date, events]) => (
        <div key={date} className="border rounded-lg p-3">
          <h4 className="font-medium mb-2">{date}</h4>

          {events.map((event, idx) => (
            <div
              key={idx}
              className={`${
                eventColors[event.type]
              } text-white px-2 py-1 rounded text-xs mb-1`}
            >
              {event.title}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <Layout>
      <div className=" max-w-7xl mx-auto p-6 min-h-screen">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-semibold text-gray-800">Lorem Ipsum</h2>
            <p className="text-sm text-gray-500">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
          <GenerateContentModal />
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm ">
          {/* HEADER */}

          {/* CALENDAR CONTROLS */}
          <div className="flex items-center justify-between mb-6">
            {/* LEFT CONTROLS */}
            <div className="flex items-center gap-2 bg-gray-50">
              {/* Prev / Next */}
              <div className="flex overflow-hidden border rounded-[6px] bg-[#F4F4F5]">
                <button
                  onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                  className="py-[10px] px-[16px] hover:bg-gray-100 text-gray-600"
                >
                  <img src="/icons/ic-left.svg"/>
                </button>
                <div className="w-px bg-gray-200" />
                <button
                  onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                  className="py-[10px] px-[16px]  hover:bg-gray-100 text-gray-600"
                >
                  <img src="/icons/ic-right.svg"/>
                </button>
              </div>

              {/* Today */}
              <button
                onClick={() => setCurrentDate(new Date())}
                className="py-[10px] px-[16px] rounded-[6px] border bg-[#F4F4F5] text-sm text-gray-700 hover:bg-gray-100"
              >
                Today
              </button>
            </div>

            {/* CENTER TITLE */}
            <h3 className="text-base font-semibold text-gray-800">
              {currentDate.toLocaleString("default", { month: "long" })} {year}
            </h3>

            {/* VIEW SWITCH */}
            <div className="flex rounded-lg border bg-gray-50 overflow-hidden text-sm">
              {views.map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`py-[10px] px-[16px] transition ${
                    view === v
                      ? "bg-white text-gray-900 font-medium shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {view === "Month" && renderMonthView()}
          {view === "Week" && renderWeekView()}
          {view === "Day" && renderDayView()}
          {view === "List" && renderListView()}
          {/* WEEK DAYS
          <div className="grid grid-cols-7 text-xs text-gray-500 border-t border-l">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="p-2 border-r border-b text-center font-medium"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 border-l border-b">
            {days.map((date, i) => (
              <div
                key={i}
                className="min-h-[110px] p-2 border-r border-t text-xs relative"
              >
                {date && (
                  <>
                    <span
                      className={`absolute top-2 right-2 ${
                        isToday(date)
                          ? "bg-gray-900 text-white px-2 rounded-full"
                          : "text-gray-700"
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    <div className="mt-6 space-y-1">
                      {(eventsData[formatKey(date)] || []).map((event, idx) =>
                        event.type === "more" ? (
                          <div key={idx} className={eventColors.more}>
                            {event.title}
                          </div>
                        ) : (
                          <div
                            key={idx}
                            className={`${
                              eventColors[event.type]
                            } text-white px-2 py-0.5 rounded`}
                          >
                            {event.title}
                          </div>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div> */}
        </div>
      </div>
    </Layout>
  );
}
