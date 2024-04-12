import approvalToolBlackImg from '../images/ApprovalTool_Black.svg';
import approvalToolWhiteImg from '../images/ApprovalTool_White.svg';
import chooseRepositoriesBlackImg from '../images/ChooseRepositories_Black.svg';
import chooseRepositoriesWhiteImg from '../images/ChooseRepositories_White.svg';
import editPullRequestBlackImg from '../images/EditPullRequest_Black.svg';
import editPullRequestWhiteImg from '../images/EditPullRequest_White.svg';
import generateCatalogInfoBlackImg from '../images/GenerateCatalogInfo_Black.svg';
import generateCatalogInfoWhiteImg from '../images/GenerateCatalogInfo_White.svg';
import trackStatusBlackImg from '../images/TrackStatus_Black.svg';
import trackStatusWhiteImg from '../images/TrackStatus_White.svg';

const logos = new Map<string, any>()
  .set('icon-edit-pullrequest-black', editPullRequestBlackImg)
  .set('icon-generate-cataloginfo-black', generateCatalogInfoBlackImg)
  .set('icon-track-status-black', trackStatusBlackImg)
  .set('icon-choose-repositories-black', chooseRepositoriesBlackImg)
  .set('icon-approval-tool-black', approvalToolBlackImg)
  .set('icon-edit-pullrequest-white', editPullRequestWhiteImg)
  .set('icon-choose-repositories-white', chooseRepositoriesWhiteImg)
  .set('icon-generate-cataloginfo-white', generateCatalogInfoWhiteImg)
  .set('icon-track-status-white', trackStatusWhiteImg)
  .set('icon-approval-tool-white', approvalToolWhiteImg);

export const getImageForIconClass = (iconClass: string): string => {
  return logos.get(iconClass);
};
