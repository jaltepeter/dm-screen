import Slide from '@mui/material/Slide';
import { forwardRef } from 'react';

export const SlideUpTransition = forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});
