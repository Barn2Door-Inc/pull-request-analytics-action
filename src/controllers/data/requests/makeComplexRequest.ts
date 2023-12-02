import { getDataWithThrottle } from "./getDataWithThrottle";
import { getPullRequestChecks } from "./getPullRequestChecks";
import { getPullRequests } from "./getPullRequests";
import { Options } from "./types";

export const makeComplexRequest = async (
  amount: number = 10,
  options: Options = {
    skipChecks: true,
    skipComments: true,
    skipCommits: true,
    skipReviews: true,
  }
) => {
  const pullRequests = await getPullRequests(amount);
  const { skipChecks = true } = options;

  const pullRequestNumbers = pullRequests.map((item) => item.number);

  const { PRs, PREvents, PRComments, PRCommits } = await getDataWithThrottle(
    pullRequestNumbers,
    options
  );

  const reviews = PREvents.map((element) =>
    element.status === "fulfilled" ? element.value.data : null
  );

  const pullRequestInfo = PRs.map((element) =>
    element.status === "fulfilled" ? element.value.data : null
  );

  const comments = PRComments.map((element) =>
    element.status === "fulfilled" ? element.value.data : null
  );

  const commits = PRCommits.map((element) =>
    element.status === "fulfilled" ? element.value.data : null
  );

  const commitRefs = PRCommits.map((element) =>
    element.status === "fulfilled" ? element.value.data : null
  );

  const shas = commitRefs?.flat().map((element) => element?.sha);
  const pullRequestChecks = await getPullRequestChecks(
    shas.filter((element) => typeof element === "string") as string[],
    {
      skip: skipChecks,
    }
  );
  const PRChecks = await Promise.allSettled(pullRequestChecks);
  const checks = PRChecks.map((element) =>
    element.status === "fulfilled"
      ? element.value.status === "fulfilled"
        ? element.value.value.data
        : null
      : null
  );

  return {
    reviews,
    pullRequestInfo,
    commits,
    comments,
    checks,
  };
};