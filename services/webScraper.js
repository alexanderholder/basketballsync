import fetch from "node-fetch";
import * as cheerio from "cheerio";

// Example HTML:
{
  /* <tr class="row-8 even">
  <td class="column-1">6:30pm</td>
  <td class="column-2"></td>
  <td class="column-3"></td>
  <td class="column-4"></td>
  <td class="column-5"></td>
  <td class="column-6"></td>
</tr>
<tr class="row-9 odd">
  <td class="column-1">Court 1 </td>
  <td class="column-2">Setsy Beaches</td>
  <td class="column-3">vs</td>
  <td class="column-4">Send Tuesday</td>
  <td class="column-5">DIV1A</td>
  <td class="column-6">Tay</td>
</tr> */
}

const teamName = "T-BONES";
const url =
  "https://www.brisbanecityindoorsports.com.au/fixi_feed_coorparoo.php?sportFixId=b27b0677-a318-487d-8300-cfb102797f9f&sp=2965&div=7568&sea=6110";

const fetchGameDetails = async () => {
  // Get the HTML from the URL
  const response = await fetch(url);
  const body = await response.text();
  if (!body) throw new Error("Could not get HTML from URL");

  return extractGameDetails(teamName, body);
};

const extractGameDetails = (teamName, body) => {
  const $ = cheerio.load(body);

  // Find the cell with our team name
  const teamCell = $(`td:icontains(${teamName})`);
  if (!teamCell?.length) throw new Error(`Could not find ${teamName}s cell`);

  const gameDetails = teamCell.prevAll().eq(0);

  const court = gameDetails.find("strong").text();
  if (!court.trim()) throw new Error(`Could not find court number`);

  // Find the first time above the team cell
  const fullTimeText = gameDetails.find("span").text();
  if (!fullTimeText.trim()) throw new Error(`Could not find game time`);

  // Convert the time and date into a Date object
  const dateTime = new Date(fullTimeText);
  if (isNaN(dateTime.getTime()))
    throw new Error(`Could not parse date string: ${fullTimeText}`);

  return { court, dateTime };
};

export default fetchGameDetails;
