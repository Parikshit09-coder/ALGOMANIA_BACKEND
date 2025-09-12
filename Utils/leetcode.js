// Use dynamic import for node-fetch
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const LEETCODE_QUERY = `
  query recentAcSubmissions($username: String!) {
    recentAcSubmissionList(username: $username) {
      id
      title
      titleSlug
      timestamp
      statusDisplay
    }
  }
`;

const difficultyPoints = { Easy: 2, Medium: 3, Hard: 5 };

// Fetch solved problems between start and end dates
async function getUserSolvedBetweenDates(username, startDate, endDate) {
  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: LEETCODE_QUERY,
      variables: { username },
    }),
  });

  const data = await response.json();
  if (!data.data || !data.data.recentAcSubmissionList) return [];

  return data.data.recentAcSubmissionList.filter((sub) => {
    const subDate = new Date(parseInt(sub.timestamp) * 1000);
    return subDate >= startDate && subDate <= endDate;
  });
}

// Fetch difficulty for a problem
async function getProblemDifficulty(titleSlug) {
  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query getQuestion($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            difficulty
          }
        }
      `,
      variables: { titleSlug },
    }),
  });

  const data = await response.json();
  return data.data?.question?.difficulty || null;
}

// Calculate score for one member between dates
async function calculateMemberScore(member, startDate, endDate) {
  const solved = await getUserSolvedBetweenDates(member.userName, startDate, endDate);
  let score = 0;

  for (let problem of solved) {
    const difficulty = await getProblemDifficulty(problem.titleSlug);
    if (difficulty && difficultyPoints[difficulty]) {
      score += difficultyPoints[difficulty];
    }
  }

  return score;
}

module.exports = { calculateMemberScore };
