import NextAuth from 'next-auth';
import { authOptions } from './auth-options';

const { handlers, auth } = NextAuth(authOptions);

export { handlers, auth };
export default NextAuth(authOptions);
