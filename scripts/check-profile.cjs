// Run after compiling the customized upstream generator. No network or tokens.
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(process.argv[2]);
const { profilePeriod } = require(path.join(root, 'dist0/src/profile-period.js'));
const { createSvg } = require(path.join(root, 'dist0/src/create-svg.js'));
const colors = require(path.join(root, 'dist0/src/color-template.js'));
const client = require(path.join(root, 'dist0/src/github-graphql.js'));
const axios = require(path.join(root, 'node_modules/axios/dist/node/axios.cjs'));
const MockAdapter = require(path.join(root, 'node_modules/axios-mock-adapter'));
const { JSDOM } = require(path.join(root, 'node_modules/jsdom'));

(async () => {
  for (const [end, start] of [
    ['2026-10-06', '2026-04-06'],
    ['2026-08-31', '2026-02-28'],
    ['2024-08-31', '2024-02-29'],
    ['2026-01-31', '2025-07-31'],
    ['2026-03-31', '2025-09-30'],
  ]) {
    const now = new Date(`${end}T12:34:56Z`);
    assert.deepEqual(profilePeriod(now), {from:`${start}T00:00:00.000Z`, to:now.toISOString()});
  }
  const mock = new MockAdapter(axios);
  let query;
  mock.onPost(client.URL).reply(config => {
    query = JSON.parse(config.data).query;
    return [200, {data:{}}];
  });
  try {
    await client.fetchFirst('test-token', 'test-user');
    const range = query.match(/contributionsCollection\(from:"([^"]+)", to:"([^"]+)"\)/);
    assert.ok(range, 'The GraphQL query must request an explicit date range.');
    assert.deepEqual(profilePeriod(new Date(range[2])), {from:range[1],to:range[2]});
  } finally { mock.restore(); }

  const from = new Date('2026-04-06T00:00:00Z');
  const to = new Date('2026-10-06T00:00:00Z');
  const calendar = [];
  for(let day = +from; day <= +to; day += 86400000) {
    calendar.push({date:new Date(day), contributionCount:1, contributionLevel:1});
  }
  const info = {
    isHalloween:false, contributionCalendar:calendar,
    contributesLanguage:[{language:'Python',color:'#3572A5',contributions:calendar.length}],
    totalContributions:calendar.length, totalCommitContributions:calendar.length,
    totalIssueContributions:0,totalPullRequestContributions:0,
    totalPullRequestReviewContributions:0,totalRepositoryContributions:0,
    totalForkCount:0,totalStargazerCount:0,
  };
  for(const setting of [colors.NorthSeasonSettings, colors.NightRainbowSettings]) {
    const svg = createSvg(info, setting, true);
    const dom = new JSDOM(svg, {contentType:'image/svg+xml'});
    const doc = dom.window.document;
    const labels = [...doc.querySelectorAll('text')].map(t=>t.textContent);
    assert.ok(labels.includes('2026-04-06 / 2026-10-06'));
    assert.ok(labels.includes(String(calendar.length)));
    for(const label of ['Commit','Repo','Review','PullReq','Issue']) assert.ok(!labels.includes(label));
    assert.ok(labels.includes('Python'), 'Keep the language chart.');
    assert.equal(doc.querySelectorAll('rect[class*="-top"]').length, calendar.length);
    assert.ok(doc.querySelector('animateTransform'), 'Keep contribution animation.');
    dom.window.close();
  }
  console.log('PASS: rolling six months, month-end/leap-year boundaries, GraphQL range, both themes, calendar day count, totals, no radar, language chart and animation.');
})().catch(error=>{console.error(error);process.exit(1)});
