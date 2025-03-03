import localFont from 'next/font/local'

export const aeonik = localFont({
  src: [
    {
      path: './AeonikTRIAL-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './AeonikTRIAL-Regular.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './AeonikTRIAL-Bold.otf',
      weight: '700',
      style: 'normal',
    }
  ],
  variable: '--font-aeonik'
}) 