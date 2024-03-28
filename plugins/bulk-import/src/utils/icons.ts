import appImg from '../images/App.svg';
import fileSyncImg from '../images/FileSync.svg';
import thinkingManImg from '../images/ThinkingMan.svg';
import workingManWithPhoneImg from '../images/WorkingManWithAPhone.svg';
import workingManWithDogImg from '../images/WorkingWithDog.svg';

const logos = new Map<string, any>()
  .set('icon-app', appImg)
  .set('icon-file-sync', fileSyncImg)
  .set('icon-workingman-dog', workingManWithDogImg)
  .set('icon-workingman-phone', workingManWithPhoneImg)
  .set('icon-thinking-man', thinkingManImg);

export const getImageForIconClass = (iconClass: string): string => {
  return logos.get(iconClass);
};
