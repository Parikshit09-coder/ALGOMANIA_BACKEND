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

const difficultyPoints = { Easy: 1, Medium: 3, Hard: 5 };

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
// Calculate score for one member between dates
async function calculateMemberScore(member, startDate, endDate, allowedProblems) {
  try {
    
    const submissions = await getUserSolvedBetweenDates(member.userName, startDate, endDate);

    let score = 0;
    let scoredProblems = new Set(); // Track already scored problems
    let scoredDetails = [];

    for (let sub of submissions) {
      // Skip duplicates and non-allowed problems
      if (scoredProblems.has(sub.titleSlug)) {
        continue;
      }
      
      if (!allowedProblems.includes(sub.titleSlug)) {
        continue;
      }
      
      if (sub.statusDisplay !== "Accepted") {
        continue;
      }

      try {
        const difficulty = await getProblemDifficulty(sub.titleSlug);
        if (difficulty && difficultyPoints[difficulty]) {
          const points = difficultyPoints[difficulty];
          score += points;
          scoredProblems.add(sub.titleSlug);
          
          const submissionDate = new Date(parseInt(sub.timestamp) * 1000);
          scoredDetails.push({ 
            problem: sub.titleSlug, 
            difficulty, 
            points,
            date: submissionDate.toISOString().split('T')[0]
          });
          
        }
      } catch (error) {
        console.error(`   ❌ Error processing ${sub.titleSlug}:`, error.message);
      }
    }

    if (scoredDetails.length > 0) {
    }
    
    return score;
    
  } catch (error) {
    console.error(`   💥 Error calculating score for ${member.userName}:`, error.message);
    return 0; // Return 0 if there's an error to avoid breaking the whole process
  }
}
module.exports = { calculateMemberScore };
