const toastKeyMap: { [key: string]: string[] } = {
  status: ['status', 'status_description'],
  success: ['success', 'success_description'],
  error: ['error', 'error_description'],
};

const getToastRedirect = (
  path: string,
  toastType: string,
  toastTitle: string,
  toastDescription: string = '',
  disableButton: boolean = false,
  arbitraryParams: string = ''
): string => {
  const [nameKey, descriptionKey] = toastKeyMap[toastType];

  let redirectPath = `${path}?${nameKey}=${encodeURIComponent(toastTitle)}`;

  if (toastDescription) {
    redirectPath += `&${descriptionKey}=${encodeURIComponent(toastDescription)}`;
  }

  if (disableButton) {
    redirectPath += `&disable_button=true`;
  }

  if (arbitraryParams) {
    redirectPath += `&${arbitraryParams}`;
  }

  return redirectPath;
};

export const getStatusRedirect = (
  path: string,
  statusTitle: string,
  statusDescription: string = '',
  disableButton: boolean = false,
  arbitraryParams: string = ''
) =>
  getToastRedirect(path, 'status', statusTitle, statusDescription, disableButton, arbitraryParams);

export const getSuccessRedirect = (
  path: string,
  successDescription: string = '',
  disableButton: boolean = false,
  arbitraryParams: string = ''
) =>
  getToastRedirect(path, 'success', 'Success!', successDescription, disableButton, arbitraryParams);

export const getErrorRedirect = (
  path: string,
  errorDescription: string = '',
  disableButton: boolean = false,
  arbitraryParams: string = ''
) => getToastRedirect(path, 'error', 'Error', errorDescription, disableButton, arbitraryParams);
