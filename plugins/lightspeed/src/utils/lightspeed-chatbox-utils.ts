import { BaseMessage } from '../types';

export const getFootnoteProps = () => ({
  label: 'Lightspeed uses AI. Check for mistakes.',
  popover: {
    title: 'Verify accuracy',
    description: `While Lightspeed strives for accuracy, there's always a possibility of errors. It's a good practice to verify critical information from reliable sources, especially if it's crucial for decision-making or actions.`,
    bannerImage: {
      src: 'https://cdn.dribbble.com/userupload/10651749/file/original-8a07b8e39d9e8bf002358c66fce1223e.gif',
      alt: 'Example image for footnote popover',
    },
    cta: {
      label: 'Got it',
      onClick: () => {},
    },
    link: {
      label: 'Learn more',
      url: 'https://www.redhat.com/',
    },
  },
});

export const getTimestampVariablesString = (v: number) => {
  if (v < 10) {
    return `0${v}`;
  }
  return `${v}`;
};

export const getTimestamp = (unix_timestamp: number) => {
  if (typeof unix_timestamp !== 'number' || isNaN(unix_timestamp)) {
    // eslint-disable-next-line no-console
    console.error('Invalid Unix timestamp provided');
    return '';
  }

  const a = new Date(unix_timestamp);
  const month = getTimestampVariablesString(a.getMonth() + 1);
  const year = a.getFullYear();
  const date = getTimestampVariablesString(a.getDate());
  const hour = getTimestampVariablesString(a.getHours());
  const min = getTimestampVariablesString(a.getMinutes());
  const sec = getTimestampVariablesString(a.getSeconds());
  const time = `${date}/${month}/${year}, ${hour}:${min}:${sec}`;
  return time;
};

export const splitJsonStrings = (jsonString: string): string[] => {
  const chunks = jsonString.split('}{');

  if (chunks.length <= 1) {
    return [jsonString];
  }

  return chunks.map((chunk, index, arr) => {
    if (index === 0) {
      return `${chunk}}`;
    } else if (index === arr.length - 1) {
      return `{${chunk}`;
    }
    return `{${chunk}}`;
  });
};

type MessageProps = {
  content: string;
  timestamp: string;
  name?: string;
  avatar?: string | any;
  isLoading?: boolean;
};

export const createMessage = ({
  role,
  name = 'Guest',
  avatar,
  isLoading = false,
  content,
  timestamp,
}: MessageProps & { role: 'user' | 'bot' }) => ({
  role,
  name,
  avatar,
  isLoading,
  content,
  timestamp,
});

export const createUserMessage = (props: MessageProps) =>
  createMessage({
    ...props,
    role: 'user',
    name: props.name ?? 'Guest',
  });

export const createBotMessage = (props: MessageProps) =>
  createMessage({
    ...props,
    role: 'bot',
  });

export const getMessageData = (message: BaseMessage) => {
  return {
    content: message?.kwargs?.content || '',
    timestamp: getTimestamp(message?.kwargs?.response_metadata?.created_at),
  };
};
