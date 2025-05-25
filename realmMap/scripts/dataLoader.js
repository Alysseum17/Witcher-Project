import { mapName, apiUrl } from './helper.js';
import { apiJSON } from '../../script/apiClient.js';
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
export const data = await apiJSON(
  `${apiUrl}/markers?limit=2000&map=${mapName}`,
  {
    method: 'GET',
  },
)
  .then((data) => data.data.marker)
  .catch((e) => console.error(e));
export const names = await fetchData('commonNames.json')
  .then((data) => data)
  .catch((e) => console.error(e));
