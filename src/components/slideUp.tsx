import Slide, { SlideProps } from '@mui/material/Slide';
import { forwardRef } from 'react';

export const SlideUpTransition = forwardRef<unknown, SlideProps>(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});
