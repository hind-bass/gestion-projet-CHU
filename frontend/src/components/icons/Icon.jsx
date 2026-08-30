import layoutDashboard from '../../assets/icons/layout-dashboard.svg?raw';
import squareKanban from '../../assets/icons/square-kanban.svg?raw';
import squareCheckBig from '../../assets/icons/square-check-big.svg?raw';
import calendarDays from '../../assets/icons/calendar-days.svg?raw';
import handshake from '../../assets/icons/handshake.svg?raw';
import folder from '../../assets/icons/folder.svg?raw';
import folderOpen from '../../assets/icons/folder-open.svg?raw';
import users from '../../assets/icons/users.svg?raw';
import scrollText from '../../assets/icons/scroll-text.svg?raw';
import bot from '../../assets/icons/bot.svg?raw';
import search from '../../assets/icons/search.svg?raw';
import logOut from '../../assets/icons/log-out.svg?raw';
import bell from '../../assets/icons/bell.svg?raw';
import plus from '../../assets/icons/plus.svg?raw';
import link from '../../assets/icons/link.svg?raw';
import x from '../../assets/icons/x.svg?raw';
import mail from '../../assets/icons/mail.svg?raw';
import lock from '../../assets/icons/lock.svg?raw';
import eye from '../../assets/icons/eye.svg?raw';
import eyeOff from '../../assets/icons/eye-off.svg?raw';
import arrowRight from '../../assets/icons/arrow-right.svg?raw';
import triangleAlert from '../../assets/icons/triangle-alert.svg?raw';
import fileText from '../../assets/icons/file-text.svg?raw';
import target from '../../assets/icons/target.svg?raw';
import user from '../../assets/icons/user.svg?raw';
import check from '../../assets/icons/check.svg?raw';
import flame from '../../assets/icons/flame.svg?raw';
import lightbulb from '../../assets/icons/lightbulb.svg?raw';
import bookOpen from '../../assets/icons/book-open.svg?raw';
import hand from '../../assets/icons/hand.svg?raw';
import zap from '../../assets/icons/zap.svg?raw';
import partyPopper from '../../assets/icons/party-popper.svg?raw';
import timer from '../../assets/icons/timer.svg?raw';
import hourglass from '../../assets/icons/hourglass.svg?raw';
import settings from '../../assets/icons/settings.svg?raw';
import circleCheck from '../../assets/icons/circle-check.svg?raw';
import clock from '../../assets/icons/clock.svg?raw';
import shield from '../../assets/icons/shield.svg?raw';
import save from '../../assets/icons/save.svg?raw';
import send from '../../assets/icons/send.svg?raw';
import octagonAlert from '../../assets/icons/octagon-alert.svg?raw';
import rocket from '../../assets/icons/rocket.svg?raw';
import sparkles from '../../assets/icons/sparkles.svg?raw';
import pencil from '../../assets/icons/pencil.svg?raw';
import cpu from '../../assets/icons/cpu.svg?raw';
import trash2 from '../../assets/icons/trash-2.svg?raw';
import refreshCw from '../../assets/icons/refresh-cw.svg?raw';

const ICONS = {
  'layout-dashboard': layoutDashboard,
  'square-kanban': squareKanban,
  'square-check-big': squareCheckBig,
  'calendar-days': calendarDays,
  handshake,
  folder,
  'folder-open': folderOpen,
  users,
  'scroll-text': scrollText,
  bot,
  search,
  'log-out': logOut,
  bell,
  plus,
  link,
  x,
  mail,
  lock,
  eye,
  'eye-off': eyeOff,
  'arrow-right': arrowRight,
  'triangle-alert': triangleAlert,
  'file-text': fileText,
  target,
  user,
  check,
  flame,
  lightbulb,
  'book-open': bookOpen,
  hand,
  zap,
  'party-popper': partyPopper,
  timer,
  hourglass,
  settings,
  'circle-check': circleCheck,
  clock,
  shield,
  save,
  send,
  'octagon-alert': octagonAlert,
  rocket,
  sparkles,
  pencil,
  cpu,
  'trash-2': trash2,
  'refresh-cw': refreshCw,
};

function prepareSvg(svg) {
  return svg
    .replace(/\swidth="24"/, '')
    .replace(/\sheight="24"/, '')
    .replace(/\sclass="[^"]*"/, '');
}

export default function Icon({ name, className = 'w-4 h-4' }) {
  const svg = ICONS[name];
  if (!svg) return null;
  return (
    <span
      className={`app-icon ${className}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: prepareSvg(svg) }}
    />
  );
}
