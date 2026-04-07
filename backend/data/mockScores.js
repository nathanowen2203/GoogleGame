// Realistic fallback scores when Google Trends API is unavailable.
// Scores are relative interest (0-100). Based on known cultural patterns.
const MOCK_SCORES = {
  'Taylor Swift': {
    US: 100, GB: 72, AU: 68, CA: 75, DE: 45, FR: 38, IN: 22, NG: 18,
    BR: 40, JP: 35, KR: 30, MX: 50, AR: 42, PH: 55, PK: 12, TR: 25,
    IT: 35, ES: 40, NL: 48, SE: 52, SG: 45, EG: 15, ID: 28, TH: 32,
    VN: 20, MY: 38, GH: 22, KE: 20, ZA: 35, SA: 20,
  },
  'Bitcoin': {
    US: 65, GB: 60, AU: 55, CA: 58, DE: 70, FR: 55, IN: 45, NG: 100,
    BR: 75, JP: 50, KR: 80, MX: 60, AR: 85, PH: 72, PK: 40, TR: 90,
    IT: 50, ES: 52, NL: 62, SE: 65, SG: 75, EG: 55, ID: 60, TH: 55,
    VN: 65, MY: 68, GH: 78, KE: 70, ZA: 62, SA: 48,
  },
  'BTS': {
    US: 50, GB: 42, AU: 45, CA: 48, DE: 38, FR: 40, IN: 72, NG: 35,
    BR: 55, JP: 65, KR: 100, MX: 60, AR: 50, PH: 88, PK: 58, TR: 45,
    IT: 35, ES: 42, NL: 38, SE: 40, SG: 75, EG: 30, ID: 80, TH: 70,
    VN: 75, MY: 78, GH: 28, KE: 25, ZA: 32, SA: 38,
  },
  'ChatGPT': {
    US: 85, GB: 78, AU: 72, CA: 80, DE: 75, FR: 68, IN: 90, NG: 70,
    BR: 65, JP: 55, KR: 70, MX: 60, AR: 58, PH: 75, PK: 65, TR: 62,
    IT: 65, ES: 62, NL: 72, SE: 75, SG: 85, EG: 55, ID: 68, TH: 62,
    VN: 65, MY: 72, GH: 60, KE: 55, ZA: 65, SA: 70,
  },
  'Cricket': {
    US: 15, GB: 45, AU: 80, CA: 20, DE: 10, FR: 8, IN: 100, NG: 20,
    BR: 5, JP: 5, KR: 8, MX: 5, AR: 5, PH: 10, PK: 95, TR: 8,
    IT: 8, ES: 5, NL: 12, SE: 8, SG: 55, EG: 15, ID: 15, TH: 10,
    VN: 8, MY: 40, GH: 18, KE: 35, ZA: 65, SA: 20,
  },
  'Formula 1': {
    US: 55, GB: 82, AU: 72, CA: 60, DE: 88, FR: 80, IN: 35, NG: 25,
    BR: 90, JP: 65, KR: 42, MX: 85, AR: 60, PH: 35, PK: 22, TR: 58,
    IT: 100, ES: 85, NL: 95, SE: 72, SG: 60, EG: 28, ID: 45, TH: 40,
    VN: 35, MY: 55, GH: 22, KE: 20, ZA: 45, SA: 48,
  },
  'Cristiano Ronaldo': {
    US: 45, GB: 72, AU: 55, CA: 50, DE: 78, FR: 82, IN: 65, NG: 85,
    BR: 80, JP: 50, KR: 58, MX: 70, AR: 65, PH: 72, PK: 70, TR: 88,
    IT: 80, ES: 90, NL: 75, SE: 68, SG: 60, EG: 80, ID: 75, TH: 65,
    VN: 70, MY: 72, GH: 78, KE: 75, ZA: 70, SA: 100,
  },
  'Lionel Messi': {
    US: 65, GB: 70, AU: 60, CA: 62, DE: 75, FR: 85, IN: 72, NG: 80,
    BR: 75, JP: 55, KR: 55, MX: 80, AR: 100, PH: 75, PK: 72, TR: 82,
    IT: 78, ES: 88, NL: 72, SE: 65, SG: 62, EG: 78, ID: 72, TH: 65,
    VN: 68, MY: 70, GH: 75, KE: 72, ZA: 68, SA: 85,
  },
  'Halloween': {
    US: 100, GB: 55, AU: 45, CA: 80, DE: 40, FR: 38, IN: 15, NG: 25,
    BR: 35, JP: 50, KR: 38, MX: 70, AR: 40, PH: 58, PK: 10, TR: 20,
    IT: 30, ES: 35, NL: 42, SE: 40, SG: 48, EG: 12, ID: 20, TH: 30,
    VN: 18, MY: 38, GH: 20, KE: 15, ZA: 35, SA: 8,
  },
  'Ramadan': {
    US: 20, GB: 35, AU: 22, CA: 22, DE: 40, FR: 50, IN: 55, NG: 85,
    BR: 10, JP: 12, KR: 10, MX: 8, AR: 15, PH: 25, PK: 100, TR: 90,
    IT: 30, ES: 28, NL: 42, SE: 35, SG: 60, EG: 95, ID: 92, TH: 45,
    VN: 18, MY: 88, GH: 55, KE: 50, ZA: 35, SA: 98,
  },
  'Minecraft': {
    US: 85, GB: 80, AU: 75, CA: 82, DE: 78, FR: 70, IN: 55, NG: 45,
    BR: 72, JP: 65, KR: 60, MX: 68, AR: 65, PH: 62, PK: 50, TR: 65,
    IT: 68, ES: 70, NL: 75, SE: 80, SG: 70, EG: 40, ID: 60, TH: 58,
    VN: 55, MY: 65, GH: 40, KE: 38, ZA: 58, SA: 55,
  },
  'FIFA World Cup': {
    US: 50, GB: 80, AU: 60, CA: 52, DE: 92, FR: 95, IN: 40, NG: 88,
    BR: 100, JP: 72, KR: 75, MX: 90, AR: 98, PH: 65, PK: 45, TR: 82,
    IT: 88, ES: 92, NL: 85, SE: 72, SG: 60, EG: 80, ID: 75, TH: 68,
    VN: 70, MY: 72, GH: 85, KE: 78, ZA: 82, SA: 78,
  },
  'TikTok': {
    US: 90, GB: 85, AU: 82, CA: 88, DE: 78, FR: 80, IN: 85, NG: 75,
    BR: 88, JP: 65, KR: 70, MX: 85, AR: 80, PH: 90, PK: 78, TR: 82,
    IT: 78, ES: 82, NL: 80, SE: 78, SG: 85, EG: 72, ID: 88, TH: 85,
    VN: 90, MY: 85, GH: 68, KE: 65, ZA: 72, SA: 75,
  },
  'Netflix': {
    US: 88, GB: 82, AU: 80, CA: 85, DE: 78, FR: 80, IN: 72, NG: 65,
    BR: 82, JP: 60, KR: 75, MX: 80, AR: 75, PH: 78, PK: 58, TR: 72,
    IT: 75, ES: 78, NL: 80, SE: 78, SG: 80, EG: 55, ID: 72, TH: 68,
    VN: 65, MY: 75, GH: 55, KE: 50, ZA: 68, SA: 62,
  },
};

function getMockScore(topic, countryCode) {
  const topicData = MOCK_SCORES[topic];
  if (!topicData) {
    // Generate a pseudo-random but deterministic score based on topic + country
    const seed = (topic.charCodeAt(0) + countryCode.charCodeAt(0)) % 70;
    return 20 + seed;
  }
  return topicData[countryCode] ?? Math.floor(Math.random() * 60) + 20;
}

module.exports = { MOCK_SCORES, getMockScore };
