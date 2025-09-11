import fetch from "node-fetch";



///IMPORTANT START OF THE DATE
const AFTER_DATE = new Date("2025-09-01T00:00:00Z");
// GraphQL query for recent submissions
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

// Fixed cutoff date → 1st September 2025


// Fetch solved problems after cutoff date
async function getUserSolvedAfterDate(username) {
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
    return subDate >= AFTER_DATE;
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

// Calculate score for one member
async function calculateMemberScore(member) {
  const solved = await getUserSolvedAfterDate(member.userName);
  let score = 0;

  for (let problem of solved) {
    const difficulty = await getProblemDifficulty(problem.titleSlug);
    if (difficulty && difficultyPoints[difficulty]) {
      score += difficultyPoints[difficulty];
    }
  }

  return score;
}

export default {
  calculateMemberScore,
};
