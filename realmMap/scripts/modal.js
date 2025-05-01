export const data = await fetchData('dataWhiteOrchard.json')
  .then((data) => data)
  .catch((e) => console.error(e));
export const descriptions = await fetchData('commonDescriptions.json')
  .then((data) => data)
  .catch((e) => console.error(e));
async function fetchData(url) {
  try {
    const response = await fetch(`../${url}`);
    if (!response.ok) throw new Error('404/Network error');
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Error fetching data:', e);
    throw e;
  }
}
