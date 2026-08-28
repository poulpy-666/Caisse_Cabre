import './globals.css';

export const metadata = {
  title: 'Caisse Billetterie',
  description: 'Clôture de caisse pour association'
};

export default function RootLayout({ children }) {
  return <html lang="fr"><body>{children}</body></html>;
}
