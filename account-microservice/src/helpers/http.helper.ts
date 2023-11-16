export const buildQueryString = (params) => {
  if (!params) return '';
  return Object.entries(params).map(stringifyKeyValuePair).join('&');
};

export const stringifyKeyValuePair = ([key, value]) => {
  const valueString = Array.isArray(value) ? `["${value.join('","')}"]` : value;
  return `${key}=${encodeURIComponent(valueString)}`;
};
