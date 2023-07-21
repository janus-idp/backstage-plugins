import GitUrlParse from 'git-url-parse';

export const getCheDecoratorData = (cheCluster?: any): string | undefined => {
  return cheCluster?.status?.cheURL;
};

export const getFullGitURL = (
  gitUrl: GitUrlParse.GitUrl,
  branch?: string,
): string => {
  const baseUrl = `https://${gitUrl.resource}/${gitUrl.owner}/${gitUrl.name}`;
  if (!branch) {
    return baseUrl;
  }
  if (gitUrl.resource.includes('github')) {
    return `${baseUrl}/tree/${branch}`;
  }
  if (gitUrl.resource.includes('gitlab')) {
    return `${baseUrl}/-/tree/${branch}`;
  }
  // Branch names containing '/' do not work with bitbucket src URLs
  // https://jira.atlassian.com/browse/BCLOUD-9969
  if (gitUrl.resource.includes('bitbucket') && !branch.includes('/')) {
    return `${baseUrl}/src/${branch}`;
  }
  return baseUrl;
};

export const getEditURL = (
  vcsURI?: string,
  gitBranch?: string,
  cheURL?: string,
): string | null => {
  if (!vcsURI) {
    return null;
  }
  // eslint-disable-next-line new-cap
  const fullGitURL = getFullGitURL(GitUrlParse(vcsURI), gitBranch);
  return cheURL
    ? `${cheURL}/f?url=${fullGitURL}&policies.create=peruser`
    : fullGitURL;
};
