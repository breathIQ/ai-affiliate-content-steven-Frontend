let show;
let hide;

export const registerLoader = (showFn, hideFn) => {
  show = showFn;
  hide = hideFn;
};

export const showLoader = () => show && show();
export const hideLoader = () => hide && hide();
