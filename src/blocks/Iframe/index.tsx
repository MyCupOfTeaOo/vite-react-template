import { useQuery } from '@/hooks/useQuery';
import React, { IframeHTMLAttributes } from 'react';

export interface IframeProps extends IframeHTMLAttributes<HTMLIFrameElement> {}

export const Iframe: React.FC<IframeProps> = () => {
  const query = useQuery();
  return <iframe title="unknown" {...query} />;
};

export default Iframe;
