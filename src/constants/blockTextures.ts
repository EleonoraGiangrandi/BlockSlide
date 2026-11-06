import { BlockColor } from '../types/game';

export interface BlockTextureSet {
  full: any;
  left: any;
  mid: any;
  right: any;
}

export const BLOCK_TEXTURES: Record<BlockColor | 'gray', BlockTextureSet> = {
  purple: {
    full: require('../assets/images/blocks/purple/full.png'),
    left: require('../assets/images/blocks/purple/left.png'),
    mid: require('../assets/images/blocks/purple/mid.png'),
    right: require('../assets/images/blocks/purple/right.png'),
  },
  green: {
    full: require('../assets/images/blocks/green/full.png'),
    left: require('../assets/images/blocks/green/left.png'),
    mid: require('../assets/images/blocks/green/mid.png'),
    right: require('../assets/images/blocks/green/right.png'),
  },
  blue: {
    full: require('../assets/images/blocks/blue/full.png'),
    left: require('../assets/images/blocks/blue/left.png'),
    mid: require('../assets/images/blocks/blue/mid.png'),
    right: require('../assets/images/blocks/blue/right.png'),
  },
  gray: {
    full: require('../assets/images/blocks/gray/full.png'),
    left: require('../assets/images/blocks/gray/left.png'),
    mid: require('../assets/images/blocks/gray/mid.png'),
    right: require('../assets/images/blocks/gray/right.png'),
  },
  cyan: {
    full: require('../assets/images/blocks/cyan/full.png'),
    left: require('../assets/images/blocks/cyan/left.png'),
    mid: require('../assets/images/blocks/cyan/mid.png'),
    right: require('../assets/images/blocks/cyan/right.png'),
  },
  orange: {
    full: require('../assets/images/blocks/orange/full.png'),
    left: require('../assets/images/blocks/orange/left.png'),
    mid: require('../assets/images/blocks/orange/mid.png'),
    right: require('../assets/images/blocks/orange/right.png'),
  },
  yellow: {
    full: require('../assets/images/blocks/yellow/full.png'),
    left: require('../assets/images/blocks/yellow/left.png'),
    mid: require('../assets/images/blocks/yellow/mid.png'),
    right: require('../assets/images/blocks/yellow/right.png'),
  },
  red: {
    full: require('../assets/images/blocks/red/full.png'),
    left: require('../assets/images/blocks/red/left.png'),
    mid: require('../assets/images/blocks/red/mid.png'),
    right: require('../assets/images/blocks/red/right.png'),
  },
};
