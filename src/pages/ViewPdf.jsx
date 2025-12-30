// import { useState } from "react";
// import { Document, Page, pdfjs } from "react-pdf";
// // import "react-pdf/dist/esm/Page/AnnotationLayer.css";
// // import "react-pdf/dist/esm/Page/TextLayer.css";
// // import "react-pdf/dist/esm/Page/AnnotationLayer.css";
// // import "react-pdf/dist/esm/Page/TextLayer.css";

// // pdfjs.GlobalWorkerOptions.workerSrc = new URL(
// //   "pdfjs-dist/build/pdf.worker.min.mjs",
// //   import.meta.url
// // ).toString();

// export default function ViewPdf({ fileUrl }) {
//   const [numPages, setNumPages] = useState(null);
//   const [page, setPage] = useState(1);
//   const [scale, setScale] = useState(1);

//   return (
//     <div className="min-h-screen bg-black flex flex-col">
//       {/* TOP BAR */}
//       <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white text-sm">
//         <div className="flex items-center gap-3">
//           <span className="font-medium">File name</span>
//         </div>

//         <div className="flex items-center gap-3">
//           {/* Prev */}
//           <button
//             onClick={() => setPage((p) => Math.max(p - 1, 1))}
//             className="px-2 hover:bg-gray-700 rounded"
//           >
//             ‹
//           </button>

//           <span className="text-xs">
//             {page} / {numPages}
//           </span>

//           {/* Next */}
//           <button
//             onClick={() =>
//               setPage((p) => Math.min(p + 1, numPages))
//             }
//             className="px-2 hover:bg-gray-700 rounded"
//           >
//             ›
//           </button>

//           <span className="mx-2">|</span>

//           {/* Zoom */}
//           <button
//             onClick={() => setScale((s) => Math.max(s - 0.1, 0.5))}
//             className="px-2 hover:bg-gray-700 rounded"
//           >
//             −
//           </button>

//           <span className="text-xs">{Math.round(scale * 100)}%</span>

//           <button
//             onClick={() => setScale((s) => s + 0.1)}
//             className="px-2 hover:bg-gray-700 rounded"
//           >
//             +
//           </button>
//         </div>

//         <div className="flex items-center gap-3">
//           {/* Download */}
//           <a
//             href={fileUrl || "/images/sample.pdf"}
//             download
//             className="hover:bg-gray-700 p-2 rounded"
//           >
//             ⬇
//           </a>

//           {/* Fullscreen */}
//           <button
//             onClick={() => document.documentElement.requestFullscreen()}
//             className="hover:bg-gray-700 p-2 rounded"
//           >
//             ⛶
//           </button>
//         </div>
//       </div>

//       {/* PDF BODY */}
//       <div className="flex-1 overflow-auto bg-gray-600 flex justify-center py-6">
//         <Document
//           file={fileUrl}
//           onLoadSuccess={({ numPages }) => setNumPages(numPages)}
//           loading={<p className="text-white">Loading PDF…</p>}
//         >
//           <Page pageNumber={page} scale={scale} />
//         </Document>
//       </div>
//     </div>
//   );
// }
