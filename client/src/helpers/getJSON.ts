export const getJSON = (name: string) => {
  return JSON.parse(localStorage.getItem(name) as string);
};
