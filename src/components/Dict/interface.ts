export interface NodeMeta {
  splitLens?: number[];
  levelNum?: number;
  label?: string;
  state: 'ready' | 'loading' | 'success' | 'error' | 'notFound';
}

export interface NodeType {
  label?: string;
  state: 'ready' | 'loading' | 'success' | 'error' | 'notFound';
  father?: NodeType;
  children: {
    [key: string]: NodeType;
  };
}

export interface CascaderCache {
  [key: string]: NodeType;
}

export interface Dict {
  label: string;
  value: string;
  isLeaf: boolean;
  levelCodeLen?: string;
  description?: string;
  children?: Dict[];
}
