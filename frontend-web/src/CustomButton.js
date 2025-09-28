import React from 'react';
import { Button, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const CustomButtonRoot = styled(Button)(({ theme, variant }) => ({
 borderRadius: 8,
  padding: '8px 16px',
  fontWeight: 700,
  fontSize: 16,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.secondary.main,
  },
  // Conditionally apply styles based on the `variant` prop
  ...(variant === 'contained' && {
    color: theme.palette.getContrastText(theme.palette.primary.main),
  }),
  ...(variant === 'text' && {
    backgroundColor: 'transparent',
  }),
}));

const CustomButton = ({ children, ...props }) => {
  return (
    <CustomButtonRoot {...props}>{children}</CustomButtonRoot>
  );
};

export default CustomButton;