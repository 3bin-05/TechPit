/**
 * TECHPIT — PITSCORE RECOMMENDATION ALGORITHM
 * Feed Personalisation System v1.0
 */

// 15-genre taxonomy as specified in Section 6
export const GENRES = [
  "AI & Machine Learning",       // 0
  "Cybersecurity",               // 1
  "Web3 & Crypto",               // 2
  "Big Tech & Ethics",           // 3
  "Open Source vs Proprietary",  // 4
  "Mobile & Consumer Tech",      // 5
  "Space & Future Tech",         // 6
  "Gaming Technology",           // 7
  "Green Tech & Sustainability", // 8
  "Startups & Disruption",       // 9
  "Developer Tools & Infra",     // 10
  "Social Media & Privacy",      // 11
  "Tech Policy & Regulation",    // 12
  "Biotech & Health Tech",       // 13
  "Quantum & Emerging Tech"      // 14
];

// Helper to map legacy/shorthand categories to the 15 genres
export const mapCategoryToGenre = (category) => {
  if (!category) return GENRES[0];
  const cat = category.toLowerCase().trim();
  if (cat.includes("ai") || cat.includes("machine")) return GENRES[0];
  if (cat.includes("security") || cat.includes("cyber")) return GENRES[1];
  if (cat.includes("crypto") || cat.includes("web3") || cat.includes("blockchain")) return GENRES[2];
  if (cat.includes("ethics") || cat.includes("ethics")) return GENRES[3];
  if (cat.includes("open source") || cat.includes("proprietary") || cat.includes("licens")) return GENRES[4];
  if (cat.includes("mobile") || cat.includes("phone") || cat.includes("device") || cat.includes("hardware")) return GENRES[5];
  if (cat.includes("space") || cat.includes("future")) return GENRES[6];
  if (cat.includes("gaming") || cat.includes("game")) return GENRES[7];
  if (cat.includes("green") || cat.includes("sustain") || cat.includes("ev")) return GENRES[8];
  if (cat.includes("startup") || cat.includes("vc") || cat.includes("disrupt")) return GENRES[9];
  if (cat.includes("tool") || cat.includes("infra") || cat.includes("languages") || cat.includes("os") || cat.includes("web") || cat.includes("dev")) return GENRES[10];
  if (cat.includes("social") || cat.includes("privacy")) return GENRES[11];
  if (cat.includes("policy") || cat.includes("law") || cat.includes("regul")) return GENRES[12];
  if (cat.includes("biotech") || cat.includes("health")) return GENRES[13];
  if (cat.includes("quantum") || cat.includes("robot")) return GENRES[14];
  return GENRES[10]; // Fallback to Dev Tools & Infra
};

// ================================================================
//   VECTOR MATHEMATICS
// ================================================================

export const l2Normalize = (vector) => {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return new Array(vector.length).fill(1 / Math.sqrt(vector.length));
  return vector.map(val => val / magnitude);
};

export const dotProduct = (v1, v2) => {
  return v1.reduce((sum, val, i) => sum + val * (v2[i] || 0), 0);
};

export const cosineSimilarity = (v1, v2) => {
  // Since both vectors are L2-normalized, cosine similarity is just the dot product
  return dotProduct(v1, v2);
};

// Generates an L2-normalized 15D vector for a post/room
export const getPostTopicVector = (primaryCategory, secondaryCategories = []) => {
  const vector = new Array(15).fill(0);
  const primaryGenre = mapCategoryToGenre(primaryCategory);
  const primaryIdx = GENRES.indexOf(primaryGenre);
  
  if (primaryIdx !== -1) {
    vector[primaryIdx] = 1.0;
  }
  
  // Secondary genres get 40% weight
  secondaryCategories.forEach(cat => {
    const secGenre = mapCategoryToGenre(cat);
    const secIdx = GENRES.indexOf(secGenre);
    if (secIdx !== -1 && secIdx !== primaryIdx) {
      vector[secIdx] = 0.40;
    }
  });

  return l2Normalize(vector);
};

// Cold start initialization: Equal weights (L2-normalized)
export const getDefaultInterestVector = () => {
  const uniform = new Array(15).fill(1 / 15);
  return l2Normalize(uniform);
};

// ================================================================
//   INTEREST PROFILE DRIFT LOOP
// ================================================================

export const updateInterestVector = (oldVector, genreIndex, actionType) => {
  // Ensure the oldVector is a valid 15D array
  const vector = Array.isArray(oldVector) && oldVector.length === 15 
    ? [...oldVector] 
    : getDefaultInterestVector();

  // Define positive and negative deltas
  const deltas = {
    share: 1.0,
    comment: 0.7,
    like: 0.4,
    dwell_30s: 0.2,
    skip: -0.3,
    hide_report: -0.8
  };

  const deltaVal = deltas[actionType] || 0.0;
  
  // Apply update formula: new_weight[g] = 0.9 × old_weight[g] + 0.1 × delta[g]
  // Update the matched dimension, others decay slightly
  for (let i = 0; i < 15; i++) {
    const delta = (i === genreIndex) ? deltaVal : 0.0;
    // We constrain weights to remain positive or decay cleanly
    vector[i] = Math.max(0.01, 0.9 * vector[i] + 0.1 * delta);
  }

  // Always L2-normalize after updates to keep magnitude at 1.0
  return l2Normalize(vector);
};

// ================================================================
//   PITSCORE COMPONENT FORMULAS
// ================================================================

// 1. InterestScore (weight: 0.35)
export const calculateInterestScore = (userVector, postVector) => {
  return cosineSimilarity(userVector, postVector);
};

// 2. EngagementScore (weight: 0.25)
export const calculateEngagementScore = (room, maxRawEngagement) => {
  const likes = room.likes || 0;
  const comments = room.messageCount || room.participantCount || 0;
  const shares = room.shares || 0;
  const views = room.views || 1;

  const raw = likes + (2 * comments) + (3 * shares) + (0.1 * views);
  if (maxRawEngagement <= 0) return 0.5; // neutral fallback
  return Math.min(1.0, raw / maxRawEngagement);
};

// Helper to get raw engagement of a single room
export const getRawEngagement = (room) => {
  const likes = room.likes || 0;
  const comments = room.messageCount || room.participantCount || 0;
  const shares = room.shares || 0;
  const views = room.views || 1;
  return likes + (2 * comments) + (3 * shares) + (0.1 * views);
};

// 3. FreshnessScore (weight: 0.20)
export const calculateFreshnessScore = (room) => {
  let createdAtMs = Date.now();
  if (room.createdAt) {
    if (room.createdAt.toMillis) {
      createdAtMs = room.createdAt.toMillis();
    } else if (room.createdAt.seconds) {
      createdAtMs = room.createdAt.seconds * 1000;
    } else if (typeof room.createdAt === 'number') {
      createdAtMs = room.createdAt;
    }
  }

  const hoursOld = Math.max(0, (Date.now() - createdAtMs) / (1000 * 60 * 60));
  
  // lambdas based on topic speed (Section 2.3)
  const category = mapCategoryToGenre(room.category);
  let lambda = 0.05; // Default

  const breakingGenres = ["AI & Machine Learning", "Cybersecurity", "Web3 & Crypto"];
  const evergreenGenres = ["Open Source vs Proprietary", "Developer Tools & Infra", "Mobile & Consumer Tech"];

  if (breakingGenres.includes(category)) {
    lambda = 0.02; // Slower decay
  } else if (evergreenGenres.includes(category)) {
    lambda = 0.08; // Faster decay
  }

  return Math.exp(-lambda * hoursOld);
};

// 4. SocialScore (weight: 0.10)
export const calculateSocialScore = (room, currentUser) => {
  if (!currentUser || !currentUser.following || currentUser.following.length === 0) {
    return 0.1; // sparse graph default boost
  }

  const following = currentUser.following; // Array of followed user IDs
  let interactionScore = 0;

  // Boost if follow creator
  if (following.includes(room.createdBy)) {
    interactionScore += 1.0;
  }

  // Boost if follow any participants in room
  if (room.participants && Array.isArray(room.participants)) {
    room.participants.forEach(p => {
      if (p.uid !== currentUser.uid && following.includes(p.uid)) {
        interactionScore += 0.5;
      }
    });
  }

  // SocialScore is capped at 1.0 (equivalent to 10 interactions)
  return Math.min(1.0, interactionScore);
};

// 5. DebateHeatScore (weight: 0.10)
export const calculateDebateHeatScore = (room) => {
  const proVotes = room.proVotes || 0;
  const conVotes = room.conVotes || 0;
  const totalVotes = proVotes + conVotes;

  // Minimum Vote Threshold: Require at least 20 votes before heat is applied
  if (totalVotes < 20) {
    return 0.5; // neutral score to avoid low-sample noise
  }

  const voteRatio = proVotes / totalVotes;
  
  // Formula: DebateHeatScore = 1 − ( |vote_ratio − 0.5| × 2 )
  return 1 - (Math.abs(voteRatio - 0.5) * 2);
};

// ================================================================
//   FINAL PITSCORE RANKING FUNCTION
// ================================================================

export const calculatePitScore = (room, userVector, currentUser, maxRawEngagement) => {
  const postVector = getPostTopicVector(room.category, room.secondaryCategories || []);

  const interest = calculateInterestScore(userVector, postVector);
  const engagement = calculateEngagementScore(room, maxRawEngagement);
  const freshness = calculateFreshnessScore(room);
  const social = calculateSocialScore(room, currentUser);
  const heat = calculateDebateHeatScore(room);

  // PitScore formula
  const finalScore = (0.35 * interest) +
                     (0.25 * engagement) +
                     (0.20 * freshness) +
                     (0.10 * social) +
                     (0.10 * heat);

  return {
    finalScore: Number(finalScore.toFixed(4)),
    breakdown: {
      interest: Number(interest.toFixed(4)),
      engagement: Number(engagement.toFixed(4)),
      freshness: Number(freshness.toFixed(4)),
      social: Number(social.toFixed(4)),
      heat: Number(heat.toFixed(4))
    }
  };
};

// ================================================================
//   MAXIMAL MARGINAL RELEVANCE (MMR) & DIVERSITY RE-RANKING
// ================================================================

export const rankRoomsMMR = (rooms, userVector, currentUser, mode = "pit") => {
  if (!rooms || rooms.length === 0) return [];

  // Determine user vector
  const uVector = Array.isArray(userVector) && userVector.length === 15 
    ? userVector 
    : getDefaultInterestVector();

  // 1. Calculate max raw engagement to normalize EngagementScore
  const rawEngagements = rooms.map(r => getRawEngagement(r));
  const maxRawEngagement = Math.max(1, ...rawEngagements);

  // 2. Score all rooms using PitScore Formula
  const scoredRooms = rooms.map(room => {
    const { finalScore, breakdown } = calculatePitScore(room, uVector, currentUser, maxRawEngagement);
    const postVector = getPostTopicVector(room.category, room.secondaryCategories || []);
    return {
      ...room,
      pitScore: finalScore,
      breakdown,
      postVector,
      genre: mapCategoryToGenre(room.category)
    };
  });

  // Sort candidate pool (~800 rooms in production, here we use our entire pool)
  // Take top 200 for diversity re-ranking
  const candidates = [...scoredRooms]
    .sort((a, b) => b.pitScore - a.pitScore)
    .slice(0, 200);

  // Set MMR lambda parameter based on feed mode toggle
  // "Pit mode" → λ = 0.85 (more personalized)
  // "Explore mode" → λ = 0.55 (more variety)
  const lambda = mode === "pit" ? 0.85 : 0.55;

  const selected = [];
  const unselected = [...candidates];

  // Helper to get index of lowest weights in user's interest vector (for discovery slots)
  const getDiscoveryGenre = () => {
    let minWeight = 999;
    let minGenre = GENRES[0];
    uVector.forEach((w, idx) => {
      if (w < minWeight) {
        minWeight = w;
        minGenre = GENRES[idx];
      }
    });
    return minGenre;
  };

  const discoveryGenre = getDiscoveryGenre();

  // Iterative MMR selection
  const maxSelectionLength = Math.min(unselected.length, 25); // ~25 served per load

  for (let step = 1; step <= maxSelectionLength; step++) {
    let bestIndex = -1;
    let bestScore = -Infinity;

    // Hard Override rules (Slot Injection)
    const isDiscoverySlot = step % 7 === 0;
    const isTrendingSlot = step % 10 === 0;
    const isHeatSlot = step % 15 === 0;

    // We check genre cap rule: No more than 3 consecutive rooms from the same genre
    const checkGenreCap = (candidateGenre) => {
      const len = selected.length;
      if (len >= 3) {
        const g1 = selected[len - 1].genre;
        const g2 = selected[len - 2].genre;
        const g3 = selected[len - 3].genre;
        if (candidateGenre === g1 && candidateGenre === g2 && candidateGenre === g3) {
          return false; // Cap violated
        }
      }
      return true; // OK
    };

    for (let i = 0; i < unselected.length; i++) {
      const candidate = unselected[i];
      
      // Enforce the consecutive genre cap (skip if it violates the cap, unless we have no other options)
      if (!checkGenreCap(candidate.genre) && unselected.length > 1) {
        continue;
      }

      let currentSelectionScore = 0;

      if (isHeatSlot) {
        // Position 15 override: highest DebateHeatScore not yet selected
        currentSelectionScore = candidate.breakdown.heat;
      } else if (isTrendingSlot) {
        // Position 10 override: highest raw engagement score not yet selected
        currentSelectionScore = getRawEngagement(candidate);
      } else if (isDiscoverySlot) {
        // Position 7 override: Genre outside top user interests (discoveryGenre)
        const isDiscoveryMatch = candidate.genre === discoveryGenre;
        currentSelectionScore = isDiscoveryMatch ? 1.0 : candidate.breakdown.interest;
      } else {
        // Standard MMR formulation
        const maxSimilarity = selected.length === 0
          ? 0
          : Math.max(...selected.map(sel => cosineSimilarity(candidate.postVector, sel.postVector)));
        
        currentSelectionScore = (lambda * candidate.pitScore) - ((1 - lambda) * maxSimilarity);
      }

      if (currentSelectionScore > bestScore) {
        bestScore = currentSelectionScore;
        bestIndex = i;
      }
    }

    // Fallback in case cap skipped everyone
    if (bestIndex === -1 && unselected.length > 0) {
      bestIndex = 0;
    }

    if (bestIndex !== -1) {
      selected.push(unselected[bestIndex]);
      unselected.splice(bestIndex, 1);
    } else {
      break;
    }
  }

  return selected;
};
