import fetch from "node-fetch";

// Points for difficulty
const difficultyPoints = { Easy: 2, Medium: 3, Hard: 5 };

// Fetch recent solved submissions for a member
async function getUserSolvedBetweenDates(username, startDate, endDate) {
  const query = `
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
  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { username } }),
  });

  const data = await response.json();
  if (!data.data || !data.data.recentAcSubmissionList) return [];

  return data.data.recentAcSubmissionList.filter((sub) => {
    const subDate = new Date(parseInt(sub.timestamp) * 1000);
    return subDate >= startDate && subDate <= endDate; // ✅ date filtering
  });
}

// Fetch difficulty for a problem
async function getProblemDifficulty(titleSlug) {
  const query = `
    query getQuestion($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        difficulty
      }
    }
  `;
  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { titleSlug } }),
  });
  const data = await response.json();
  return data.data?.question?.difficulty || null;
}

// ---------------------------
// Standalone function
// ---------------------------
export async function getMemberProfile(memberUserName, startDate, endDate) {
  const solved = await getUserSolvedBetweenDates(memberUserName, startDate, endDate);
  let score = 0;
  const submissions = [];

  for (let problem of solved) {
    const difficulty = await getProblemDifficulty(problem.titleSlug);
    if (difficulty && difficultyPoints[difficulty]) score += difficultyPoints[difficulty];

    const timestamp = new Date(parseInt(problem.timestamp) * 1000)
      .toISOString()
      .replace("T", " ")
      .split(".")[0];

    submissions.push({
      title: problem.title,
      difficulty: difficulty || "Unknown",
      timestamp,
      url: `https://leetcode.com/problems/${problem.titleSlug}/`,
    });
  }

  return { userName: memberUserName, score, submissions };
}