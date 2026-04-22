import { API_BASE_URL } from '../api/config';

/** Campos de string do Privy podem ser null (não só undefined) */
type PrivyOptString = string | null | undefined;

interface LinkedAccount {
  subject?: PrivyOptString;
  username?: PrivyOptString;
  name?: PrivyOptString;
  type?: PrivyOptString;
  profilePictureUrl?: PrivyOptString;
  firstVerifiedAt?: PrivyOptString;
  latestVerifiedAt?: PrivyOptString;
}

interface TwitterUserData {
  twitter?: {
    subject?: PrivyOptString;
    username?: PrivyOptString;
    name?: PrivyOptString;
    profilePictureUrl?: PrivyOptString;
    createdAt?: PrivyOptString;
    followersCount?: number;
    followingCount?: number;
    tweetCount?: number;
    verified?: boolean;
    protected?: boolean;
    description?: PrivyOptString;
    created_at?: PrivyOptString;
    followers_count?: number;
    following_count?: number;
    tweet_count?: number;
    profile_image_url?: PrivyOptString;
    twitter_handle?: PrivyOptString;
    twitter_user_id?: PrivyOptString;
  };
  linkedAccounts?: LinkedAccount[];
}

interface BotDetectionResult {
  isBot: boolean;
  reasons: string[];
}

interface TwitterApiUserData {
  data?: {
    type?: string;
    userName?: string;
    url?: string;
    id?: string;
    name?: string;
    isBlueVerified?: boolean;
    verifiedType?: string;
    profilePicture?: string;
    coverPicture?: string;
    description?: string;
    location?: string;
    protected?: boolean;
    followers?: number;
    following?: number;
    canDm?: boolean;
    createdAt?: string;
    favouritesCount?: number;
    hasCustomTimelines?: boolean;
    isTranslator?: boolean;
    mediaCount?: number;
    statusesCount?: number;
    withheldInCountries?: string[];
    affiliatesHighlightedLabel?: Record<string, unknown>;
    possiblySensitive?: boolean;
    pinnedTweetIds?: string[];
    isAutomated?: boolean;
    automatedBy?: string;
    unavailable?: boolean;
    message?: string;
    unavailableReason?: string;
    profile_bio?: {
      description?: string;
      entities?: {
        description?: {
          urls?: Array<{
            display_url?: string;
            expanded_url?: string;
            indices?: number[];
            url?: string;
          }>;
        };
        url?: {
          urls?: Array<{
            display_url?: string;
            expanded_url?: string;
            indices?: number[];
            url?: string;
          }>;
        };
      };
    };
  };
  status?: string;
  msg?: string;
}

export async function detectTwitterBot(userData: TwitterUserData): Promise<BotDetectionResult> {
  const reasons: string[] = [];
  const twitter = userData.twitter;

  if (!twitter) {
    return {
      isBot: false,
      reasons: [],
    };
  }

  const username = twitter.username;
  
  if (twitter.subject) {
    const userExists = await checkUserExists(twitter.subject);
    if (userExists) {
      return {
        isBot: false,
        reasons,
      };
    }
  }
  
  let apiData: TwitterApiUserData | null = null;
  if (username) {
    apiData = await fetchTwitterUserData(username);
  }

  const createdAt = apiData?.data?.createdAt || twitter.createdAt || twitter.created_at;
  const profileImageUrl = apiData?.data?.profilePicture || twitter.profilePictureUrl || twitter.profile_image_url;
  const followersCount = apiData?.data?.followers ?? twitter.followersCount ?? twitter.followers_count;
  const tweetCount = apiData?.data?.statusesCount ?? twitter.tweetCount ?? twitter.tweet_count;
  const isAutomated = apiData?.data?.isAutomated;
  const protectedAccount = apiData?.data?.protected ?? twitter.protected;

  if (createdAt && isAccountTooNew(createdAt)) 
    reasons.push('Account created less than 15 days ago');

  if (hasDefaultProfileImage(profileImageUrl))
    reasons.push('Default profile image or missing');

  if (followersCount !== undefined && followersCount < 100)
    reasons.push(`Few followers (${followersCount})`);

  if (tweetCount !== undefined && tweetCount < 10)
    reasons.push(`Few tweets (${tweetCount})`);

  if (username && isSuspiciousUsername(username))
    reasons.push('Suspicious username pattern');

  if (protectedAccount === true)
    reasons.push('Private account');

  if (isAutomated === true)
    reasons.push('Automated account detected');

  /*if (isSpamLogin(userData.linkedAccounts))
    reasons.push('Suspicious activity: multiple logins in a short period'); */

  return {
    isBot: reasons.length > 0,
    reasons,
  };
}

// VALIDATE FUNCTION
async function fetchTwitterUserData(username: string): Promise<TwitterApiUserData | null> {
    if (!username) return null;
  
    try {
      const cleanUsername = username.replace(/^@/, '');
      
      const response = await fetch(`/api/twitter/user-info?userName=${encodeURIComponent(cleanUsername)}`,
        {
          method: 'GET',
        }
      );
  
      if (!response.ok) {
        console.error('Error fetching Twitter user data:', response.status, response.statusText);
        return null;
      }
  
      const data: TwitterApiUserData = await response.json();
      
      if (data.status !== 'success' || !data.data) {
        console.warn('Twitter API response not successful:', data.msg);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching Twitter user data:', error);
      return null;
    }
}

async function checkUserExists(twitterUserId: string): Promise<boolean> {
  if (!twitterUserId) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/user-exist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ twitter_id: twitterUserId }),
    });

    if (!response.ok) {
      console.error('Error checking if user exists:', response.status, response.statusText);
      return false;
    }

    const data = await response.json();
    return data?.exists === true;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
}
  
function isSuspiciousUsername(username: string): boolean {
  if (!username) return false;
  
  const cleanUsername = username.replace(/^@/, '');
  
  // Regexes para detectar usernames suspeitos
  if (/^user\d{5,}$/i.test(cleanUsername)) return true;
  
  // Letras aleatórias + números (aumentado para 5+ dígitos para evitar falsos positivos)
  // Padrões como "abcde12345" são suspeitos, mas "NomeReal2089" não
  if (/^[a-z]{5,}\d{5,}$/i.test(cleanUsername)) return true;
  
  // Underscores com números no meio
  if (/^[a-z]+_\w*\d+\w*_[a-z]+$/i.test(cleanUsername)) return true;

  // Muitos números consecutivos (6 ou mais)
  if (/\d{6,}/.test(cleanUsername)) return true;
  
  // Muitos underscores
  const underscoreCount = (cleanUsername.match(/_/g) || []).length;
  if (underscoreCount >= 3) return true;
  
  // Combinação números + underscores
  const numberCount = (cleanUsername.match(/\d/g) || []).length;
  if (numberCount >= 5 && underscoreCount >= 2) return true;
  
  return false;
}

function isAccountTooNew(createdAt?: string): boolean {
  if (!createdAt) return false;
  
  try {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const daysSinceCreated = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSinceCreated < 15;
  } catch (error) {
    console.error('Error verifying creation date:', error);
    return false;
  }
}

function hasDefaultProfileImage(profileImageUrl?: string): boolean {
  if (!profileImageUrl) return true;
  
  return profileImageUrl.includes('default_profile') || profileImageUrl.includes('default_profile_images');
}

function isSpamLogin(linkedAccounts?: LinkedAccount[]): boolean {
    if (!linkedAccounts || linkedAccounts.length === 0) return false;
    
    const twitterAccount = linkedAccounts.find(
      (account) => account.type === 'twitter_oauth' || account.type === 'twitter'
    );
    
    if (!twitterAccount) return false;
    
    const firstVerifiedAt = twitterAccount.firstVerifiedAt;
    const latestVerifiedAt = twitterAccount.latestVerifiedAt;
    
    if (!firstVerifiedAt || !latestVerifiedAt) return false;
    
    try {
      const firstDate = new Date(firstVerifiedAt);
      const latestDate = new Date(latestVerifiedAt);
      
      const minutesDifference = Math.abs((latestDate.getTime() - firstDate.getTime()) / (1000 * 60));

      if (minutesDifference < 5) return true;
      
      return false;
    } catch (error) {
      console.error('Error verifying login spam:', error);
      return false;
    }
}



