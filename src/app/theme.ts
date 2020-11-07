import React from "react";
import { createMuiTheme } from "@material-ui/core/styles"
import green from '@material-ui/core/colors/green';

const isDarkMode = () => matchMedia('(prefers-color-scheme: dark)').matches

export const appTheme = () => {
  const theme = createMuiTheme({
    palette: {
      type: isDarkMode() ? "dark" : "light",
    },
  })

  return theme
}