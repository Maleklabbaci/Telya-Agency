import React from 'react';
import { User } from '../types';

interface MessageWithMentionsProps {
  text: string;
  allUsers: User[];
}

const MessageWithMentions: React.FC<MessageWithMentionsProps> = ({ text, allUsers }) => {
  // Create a regex that matches any of the user names prefixed with @
  // This is a simplified approach. A more robust solution might handle names with special characters.
  const userNamesForRegex = allUsers
    .map(u => u.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length)
    .join('|');
  const mentionRegex = new RegExp(`@(${userNamesForRegex})`, 'g');

  if (!userNamesForRegex) {
    return <p className="text-sm">{text}</p>;
  }

  const parts = text.split(mentionRegex);

  return (
    <p className="text-sm whitespace-pre-wrap">
      {parts.map((part, index) => {
        // The parts array will be [non-mention, mention, non-mention, mention, ...]
        // Every odd-indexed element is a captured mention.
        if (index % 2 !== 0) {
          return (
            <strong key={index} className="text-green-300 font-semibold bg-green-500/20 px-1 rounded">
              @{part}
            </strong>
          );
        }
        return part;
      })}
    </p>
  );
};

export default MessageWithMentions;