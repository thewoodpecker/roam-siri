import React, { useState } from 'react';

/* Icons (copied verbatim from roam-lobby source) */
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M5.97493 11.6822C6.17019 11.8774 6.48678 11.8774 6.68204 11.6822C6.8773 11.4869 6.8773 11.1703 6.68204 10.975L4.2073 8.50031L12.6569 8.50031C12.933 8.50031 13.1569 8.27645 13.1569 8.00031C13.1569 7.72416 12.933 7.50031 12.6569 7.50031L4.20692 7.50031L6.68204 5.02518C6.8773 4.82992 6.8773 4.51334 6.68204 4.31808C6.48678 4.12282 6.17019 4.12282 5.97493 4.31808L2.64645 7.64656C2.45118 7.84182 2.45118 8.15841 2.64645 8.35367L5.97493 11.6822Z" fill="currentColor" />
  </svg>
);
const LinkChainIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6.23223 3.40371C7.98959 1.64635 10.8388 1.64635 12.5962 3.40371C14.3536 5.16107 14.3536 8.01031 12.5962 9.76767L12.2426 10.1212C12.0474 10.3165 11.7308 10.3165 11.5355 10.1212C11.3403 9.92596 11.3403 9.60938 11.5355 9.41412L11.8891 9.06057C13.2559 7.69373 13.2559 5.47765 11.8891 4.11082C10.5223 2.74398 8.30617 2.74398 6.93934 4.11082L6.58578 4.46437C6.39052 4.65964 6.07394 4.65964 5.87868 4.46437C5.68342 4.26911 5.68342 3.95253 5.87868 3.75727L6.23223 3.40371ZM10.1213 5.87859C10.3166 6.07385 10.3166 6.39043 10.1213 6.58569L6.58578 10.1212C6.39052 10.3165 6.07394 10.3165 5.87868 10.1212C5.68342 9.92597 5.68342 9.60938 5.87868 9.41412L9.41421 5.87859C9.60947 5.68332 9.92606 5.68332 10.1213 5.87859ZM4.46446 5.87859C4.65973 6.07385 4.65973 6.39043 4.46446 6.58569L4.11091 6.93925C2.74408 8.30608 2.74408 10.5222 4.11091 11.889C5.47775 13.2558 7.69382 13.2558 9.06066 11.889L9.41421 11.5354C9.60947 11.3402 9.92606 11.3402 10.1213 11.5354C10.3166 11.7307 10.3166 12.0473 10.1213 12.2425L9.76777 12.5961C8.01041 14.3535 5.16116 14.3535 3.4038 12.5961C1.64644 10.8387 1.64645 7.9895 3.4038 6.23214L3.75736 5.87859C3.95262 5.68332 4.2692 5.68332 4.46446 5.87859Z" fill="currentColor" />
  </svg>
);
const PaletteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2C4.69 2 2 4.69 2 8C2 11.31 4.69 14 8 14C8.55 14 9 13.55 9 13C9 12.76 8.9 12.54 8.74 12.38C8.59 12.21 8.5 12 8.5 11.75C8.5 11.2 8.95 10.75 9.5 10.75H10.5C12.43 10.75 14 9.18 14 7.25C14 4.36 11.31 2 8 2ZM4.5 8.75C3.95 8.75 3.5 8.3 3.5 7.75C3.5 7.2 3.95 6.75 4.5 6.75C5.05 6.75 5.5 7.2 5.5 7.75C5.5 8.3 5.05 8.75 4.5 8.75ZM6 5.75C5.45 5.75 5 5.3 5 4.75C5 4.2 5.45 3.75 6 3.75C6.55 3.75 7 4.2 7 4.75C7 5.3 6.55 5.75 6 5.75ZM10 5.75C9.45 5.75 9 5.3 9 4.75C9 4.2 9.45 3.75 10 3.75C10.55 3.75 11 4.2 11 4.75C11 5.3 10.55 5.75 10 5.75ZM12 8.75C11.45 8.75 11 8.3 11 7.75C11 7.2 11.45 6.75 12 6.75C12.55 6.75 13 7.2 13 7.75C13 8.3 12.55 8.75 12 8.75Z" fill="currentColor" />
  </svg>
);
const CalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M6 1C6 0.723858 5.77614 0.5 5.5 0.5C5.22386 0.5 5 0.723858 5 1V1.50544C4.74737 1.51019 4.52097 1.51908 4.31729 1.53572C3.86949 1.57231 3.48765 1.64884 3.13803 1.82698C2.57354 2.1146 2.1146 2.57354 1.82698 3.13803C1.64884 3.48765 1.57231 3.86949 1.53572 4.31729C1.52097 4.4978 1.51231 4.69616 1.50723 4.91481C1.50248 4.94249 1.5 4.97096 1.5 5C1.5 5.02234 1.50147 5.04434 1.5043 5.0659C1.5 5.33871 1.5 5.64139 1.5 5.97812V10.0219C1.5 10.7034 1.49999 11.2454 1.53572 11.6827C1.57231 12.1305 1.64884 12.5123 1.82698 12.862C2.1146 13.4265 2.57354 13.8854 3.13803 14.173C3.48765 14.3512 3.86949 14.4277 4.31729 14.4643C4.75457 14.5 5.29657 14.5 5.97806 14.5H10.0219C10.7034 14.5 11.2454 14.5 11.6827 14.4643C12.1305 14.4277 12.5123 14.3512 12.862 14.173C13.4265 13.8854 13.8854 13.4265 14.173 12.862C14.3512 12.5123 14.4277 12.1305 14.4643 11.6827C14.5 11.2454 14.5 10.7034 14.5 10.0219V5.97811C14.5 5.6414 14.5 5.3387 14.4957 5.0659C14.4985 5.04434 14.5 5.02234 14.5 5C14.5 4.97096 14.4975 4.9425 14.4928 4.91481C14.4877 4.69616 14.479 4.4978 14.4643 4.31729C14.4277 3.86949 14.3512 3.48765 14.173 3.13803C13.8854 2.57354 13.4265 2.1146 12.862 1.82698C12.5123 1.64884 12.1305 1.57231 11.6827 1.53572C11.479 1.51908 11.2526 1.51019 11 1.50544V1C11 0.723858 10.7761 0.5 10.5 0.5C10.2239 0.5 10 0.723858 10 1V1.5H6V1ZM13.475 4.5C13.4728 4.46543 13.4703 4.43169 13.4676 4.39872C13.4361 4.01276 13.3764 3.77717 13.282 3.59202C13.0903 3.21569 12.7843 2.90973 12.408 2.71799C12.2228 2.62365 11.9872 2.56393 11.6013 2.5324C11.4257 2.51806 11.2282 2.51006 11 2.50561V3C11 3.27614 10.7761 3.5 10.5 3.5C10.2239 3.5 10 3.27614 10 3V2.5H6V3C6 3.27614 5.77614 3.5 5.5 3.5C5.22386 3.5 5 3.27614 5 3V2.50561C4.77176 2.51006 4.57426 2.51806 4.39872 2.5324C4.01276 2.56393 3.77717 2.62365 3.59202 2.71799C3.21569 2.90973 2.90973 3.21569 2.71799 3.59202C2.62365 3.77717 2.56393 4.01276 2.5324 4.39872C2.52971 4.43169 2.52724 4.46543 2.52497 4.5H13.475ZM2.50058 5.5C2.50003 5.65443 2.5 5.82057 2.5 6V10C2.5 10.7083 2.50039 11.2095 2.5324 11.6013C2.56393 11.9872 2.62365 12.2228 2.71799 12.408C2.90973 12.7843 3.21569 13.0903 3.59202 13.282C3.77717 13.3764 4.01276 13.4361 4.39872 13.4676C4.79052 13.4996 5.29168 13.5 6 13.5H10C10.7083 13.5 11.2095 13.4996 11.6013 13.4676C11.9872 13.4361 12.2228 13.3764 12.408 13.282C12.7843 13.0903 13.0903 12.7843 13.282 12.408C13.3764 12.2228 13.4361 11.9872 13.4676 11.6013C13.4996 11.2095 13.5 10.7083 13.5 10V6C13.5 5.82057 13.5 5.65443 13.4994 5.5H2.50058Z" fill="currentColor" />
  </svg>
);
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2C11.3137 2 14 4.68629 14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2ZM8 3C5.23858 3 3 5.23858 3 8C3 10.7614 5.23858 13 8 13C10.7614 13 13 10.7614 13 8C13 5.23858 10.7614 3 8 3ZM7.50153 5C7.74699 5 7.95114 5.17688 7.99347 5.41012L8.00153 5.5V8H9.5C9.77614 8 10 8.22386 10 8.5C10 8.74546 9.82312 8.94961 9.58988 8.99194L9.5 9H7.50153C7.25607 9 7.05192 8.82312 7.00958 8.58988L7.00153 8.5V5.5C7.00153 5.22386 7.22538 5 7.50153 5Z" fill="currentColor" />
  </svg>
);
const DoorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M12.167 2C13.0873 2.0002 13.833 2.74662 13.833 3.66699V11.5225C13.8335 11.9992 13.8344 12.373 13.7031 12.7021C13.588 12.9908 13.4008 13.2457 13.1602 13.4424C12.8859 13.6665 12.5297 13.7788 12.0752 13.9219L9.9043 14.6074C9.4539 14.7497 9.08364 14.8669 8.78027 14.9336C8.46915 15.002 8.16661 15.0328 7.86719 14.9541C7.41826 14.8361 7.03096 14.5517 6.7832 14.1592C6.7504 14.1072 6.72148 14.0537 6.69629 13.999C6.68659 13.9996 6.67683 14 6.66699 14H6.61328C6.25721 14 5.95961 14.0003 5.7168 13.9805C5.46357 13.9598 5.2258 13.9144 5.00098 13.7998C4.65616 13.6241 4.37594 13.3438 4.2002 12.999C4.08564 12.7742 4.04023 12.5364 4.01953 12.2832C3.99969 12.0404 3.99999 11.7428 4 11.3867V9.66699C4 9.39085 4.22386 9.16699 4.5 9.16699C4.77614 9.16699 5 9.39085 5 9.66699V11.3662C5 11.7478 5.00049 12.0049 5.0166 12.2021C5.03224 12.3932 5.0601 12.4846 5.09082 12.5449C5.17072 12.7017 5.29828 12.8293 5.45508 12.9092C5.5154 12.9399 5.60682 12.9678 5.79785 12.9834C5.97312 12.9977 6.19579 12.9998 6.51074 13C6.50055 12.7461 6.5 12.4506 6.5 12.1123V5.97754C6.49955 5.5008 6.49959 5.12702 6.63086 4.79785C6.74601 4.50922 6.93227 4.25432 7.17285 4.05762C7.44723 3.8333 7.80401 3.72127 8.25879 3.57813L10.0898 3H6.63379C6.25217 3 5.99511 3.00049 5.79785 3.0166C5.60682 3.03224 5.5154 3.0601 5.45508 3.09082C5.29828 3.17072 5.17072 3.29828 5.09082 3.45508C5.0601 3.5154 5.03224 3.60682 5.0166 3.79785C5.00049 3.9951 5 4.25217 5 4.63379V5.66699C4.99985 5.943 4.77605 6.16699 4.5 6.16699C4.22395 6.16699 4.00016 5.943 4 5.66699V4.61328C3.99999 4.25717 3.99969 3.95963 4.01953 3.7168C4.04023 3.46357 4.08564 3.2258 4.2002 3.00098C4.37594 2.65616 4.65616 2.37594 5.00098 2.2002C5.2258 2.08564 5.46357 2.04023 5.7168 2.01953C5.95962 1.99969 6.25718 1.99999 6.61328 2H12.167ZM12.2119 3.51367C12.1385 3.49437 12.0198 3.48776 11.7686 3.54297C11.5142 3.5989 11.1865 3.70243 10.708 3.85352L8.6416 4.50586C8.06468 4.68805 7.91153 4.74548 7.80567 4.83203C7.69651 4.92134 7.61189 5.037 7.55957 5.16797C7.50892 5.29498 7.5 5.45847 7.5 6.06348V12.0889C7.5 12.5906 7.50019 12.934 7.52344 13.1934C7.54641 13.4494 7.58844 13.5608 7.62891 13.625C7.74144 13.8033 7.91723 13.9326 8.12109 13.9863C8.19454 14.0056 8.31383 14.0114 8.56543 13.9561C8.81972 13.9001 9.14673 13.7975 9.625 13.6465L11.6924 12.9941C12.2688 12.8121 12.4215 12.7544 12.5273 12.668C12.6367 12.5785 12.7221 12.4623 12.7744 12.3311C12.8249 12.2041 12.833 12.0408 12.833 11.4365V5.19434C12.8325 4.80754 12.8293 4.52689 12.8096 4.30664C12.7866 4.05019 12.7456 3.93823 12.7051 3.87402C12.5925 3.69568 12.4159 3.56731 12.2119 3.51367Z" fill="currentColor" />
    <path d="M2.81311 6.14645C3.00838 5.95118 3.32496 5.95118 3.52022 6.14645L4.52022 7.14645C4.71548 7.34171 4.71548 7.65829 4.52022 7.85355L3.52022 8.85355C3.32496 9.04882 3.00838 9.04882 2.81311 8.85355C2.61785 8.65829 2.61785 8.34171 2.81311 8.14645L2.95956 8H1.5C1.22386 8 1 7.77614 1 7.5C1 7.22386 1.22386 7 1.5 7H2.95956L2.81311 6.85355C2.61785 6.65829 2.61785 6.34171 2.81311 6.14645Z" fill="currentColor" />
    <path d="M8.66667 9.33333C9.03486 9.33333 9.33333 9.03486 9.33333 8.66667C9.33333 8.29848 9.03486 8 8.66667 8C8.29848 8 8 8.29848 8 8.66667C8 9.03486 8.29848 9.33333 8.66667 9.33333Z" fill="currentColor" />
  </svg>
);
const FormIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M7.5 4.5C7.22386 4.5 7 4.72386 7 5C7 5.27614 7.22386 5.5 7.5 5.5H13.5C13.7761 5.5 14 5.27614 14 5C14 4.72386 13.7761 4.5 13.5 4.5H7.5ZM7 11C7 10.7239 7.22386 10.5 7.5 10.5H13.5C13.7761 10.5 14 10.7239 14 11C14 11.2761 13.7761 11.5 13.5 11.5H7.5C7.22386 11.5 7 11.2761 7 11Z" fill="currentColor" />
    <path d="M5 5C5 5.82843 4.32843 6.5 3.5 6.5C2.67157 6.5 2 5.82843 2 5C2 4.17157 2.67157 3.5 3.5 3.5C4.32843 3.5 5 4.17157 5 5Z" stroke="currentColor" />
    <path d="M5 11C5 11.8284 4.32843 12.5 3.5 12.5C2.67157 12.5 2 11.8284 2 11C2 10.1716 2.67157 9.5 3.5 9.5C4.32843 9.5 5 10.1716 5 11Z" stroke="currentColor" />
  </svg>
);
const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 6.5C4 4.29086 5.79086 2.5 8 2.5C10.2091 2.5 12 4.29086 12 6.5V9.5L13 11.5H3L4 9.5V6.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    <path d="M6.5 12.5C6.5 13.3284 7.17157 14 8 14C8.82843 14 9.5 13.3284 9.5 12.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);
const QuillIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M12.5649 9.80611C12.6252 9.67856 12.8066 9.67856 12.8669 9.80611C13.0438 10.1807 13.311 10.5056 13.6443 10.7517L13.6608 10.7638C13.6612 10.7641 13.6614 10.7643 13.6616 10.7644C13.7543 10.8332 13.7543 10.9719 13.6616 11.0407C13.6614 11.0408 13.6612 11.041 13.6608 11.0413L13.6443 11.0534C13.311 11.2995 13.0438 11.6243 12.8669 11.999C12.8066 12.1265 12.6252 12.1265 12.5649 11.999C12.388 11.6243 12.1209 11.2995 11.7875 11.0534L11.771 11.0413C11.7706 11.041 11.7704 11.0408 11.7702 11.0407C11.6775 10.9719 11.6775 10.8332 11.7702 10.7644C11.7704 10.7643 11.7706 10.7641 11.771 10.7638L11.7875 10.7517C12.1209 10.5056 12.388 10.1807 12.5649 9.80611Z" fill="currentColor" />
    <path d="M3.89651 10.8758C3.73195 11.7307 3.61391 12.6461 3.54009 13.6174C3.5221 13.8542 3.31557 14.0316 3.07879 14.0136C2.84202 13.9956 2.66466 13.7891 2.68265 13.5523C2.94268 10.1308 3.74528 7.2578 5.28684 5.23182C6.84589 3.18286 9.12685 2.04517 12.2199 2.04517C12.3559 2.04517 12.484 2.10957 12.5651 2.21881C12.6462 2.32805 12.6708 2.46924 12.6315 2.59948C12.2044 4.01281 11.695 4.97932 10.9245 5.6867C10.385 6.18199 9.73877 6.53 8.9585 6.82623C9.38981 6.92666 9.96908 6.9603 10.6767 6.76541C10.8393 6.72063 11.013 6.77502 11.121 6.9045C11.229 7.03398 11.2514 7.21465 11.1782 7.36655C9.90517 10.0087 7.20672 11.2401 3.89651 10.8758ZM4.07923 10.0304C6.70747 10.297 8.77137 9.46266 9.95867 7.75726C9.35322 7.79738 8.84397 7.7049 8.44854 7.57597C8.15673 7.48084 7.92905 7.36665 7.77138 7.27388C7.69248 7.22745 7.63081 7.18621 7.58708 7.1551C7.5652 7.13954 7.54777 7.12648 7.53488 7.11654L7.51894 7.10404L7.51354 7.09967L7.51147 7.09799L7.51061 7.09727L7.51021 7.09694C7.51002 7.09679 7.50984 7.09664 7.78432 6.76569L7.50984 7.09664C7.38789 6.99549 7.33144 6.83547 7.36295 6.68019C7.39446 6.52491 7.50882 6.39954 7.66055 6.35394C8.90542 5.97976 9.72745 5.61831 10.3429 5.05325C10.8611 4.57757 11.2638 3.92824 11.6219 2.92078C9.08305 3.05657 7.25295 4.06797 5.97117 5.75253C5.11619 6.87618 4.49272 8.31593 4.07923 10.0304Z" fill="currentColor" />
    <path d="M10.935 12.4485C11.0836 12.2634 11.354 12.2336 11.5393 12.3821C11.7246 12.5306 11.7544 12.8012 11.6059 12.9865L11.2704 12.7176C11.6059 12.9865 11.6058 12.9866 11.6057 12.9867L11.6055 12.9869L11.6051 12.9875L11.6039 12.9889L11.6005 12.9931L11.5893 13.0067C11.5799 13.018 11.5667 13.0336 11.5499 13.0529C11.5163 13.0914 11.4682 13.145 11.4071 13.2086C11.2853 13.3353 11.1093 13.5043 10.8915 13.6742C10.4677 14.0049 9.82957 14.3829 9.094 14.3829C8.5288 14.3829 8.09828 14.1763 7.76452 14.0161C7.68022 13.9756 7.60208 13.9381 7.52951 13.9077C7.33631 13.8266 7.14007 13.7664 6.89578 13.7509C6.64888 13.7353 6.33161 13.7642 5.89995 13.8889C5.67181 13.9548 5.43346 13.8233 5.36758 13.5951C5.30169 13.367 5.43322 13.1286 5.66136 13.0628C6.16761 12.9166 6.58517 12.8697 6.95002 12.8927C7.31748 12.916 7.6099 13.0089 7.86227 13.1148C8.00124 13.1731 8.11905 13.2288 8.22582 13.2793C8.52727 13.422 8.74078 13.523 9.094 13.523C9.54473 13.523 9.99477 13.2833 10.3626 12.9963C10.5406 12.8573 10.6863 12.7175 10.7872 12.6126C10.8374 12.5604 10.8759 12.5174 10.9011 12.4884C10.9137 12.474 10.923 12.463 10.9287 12.4562L10.9345 12.4491L10.9349 12.4487C10.9349 12.4486 10.935 12.4486 10.935 12.4485Z" fill="currentColor" />
  </svg>
);
const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="3.5" r="1.25" fill="currentColor" />
    <circle cx="8" cy="8" r="1.25" fill="currentColor" />
    <circle cx="8" cy="12.5" r="1.25" fill="currentColor" />
  </svg>
);
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10.5 2.5L13.5 5.5L5.5 13.5H2.5V10.5L10.5 2.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
  </svg>
);
const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
    <path d="M10.5 5.5V3.5C10.5 2.67157 9.82843 2 9 2H4C3.17157 2 2.5 2.67157 2.5 3.5V9C2.5 9.82843 3.17157 10.5 4 10.5H5.5" stroke="currentColor" strokeWidth="1.1" />
  </svg>
);
const ExternalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 2H14V6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2L8 8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M6 4H4C2.89543 4 2 4.89543 2 6V12C2 13.1046 2.89543 14 4 14H10C11.1046 14 12 13.1046 12 12V10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);
const EmbedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 4L14 8L10 12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 4L2 8L6 12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevronUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 10L8 6L12 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const DashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 8H12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
const PlusSmIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
const DragHandleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="6" cy="4" r="1" fill="currentColor" /><circle cx="10" cy="4" r="1" fill="currentColor" />
    <circle cx="6" cy="8" r="1" fill="currentColor" /><circle cx="10" cy="8" r="1" fill="currentColor" />
    <circle cx="6" cy="12" r="1" fill="currentColor" /><circle cx="10" cy="12" r="1" fill="currentColor" />
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 6C6 4.89543 6.89543 4 8 4C9.10457 4 10 4.89543 10 6V7H6V6Z" stroke="currentColor" strokeWidth="1.1" />
    <rect x="4" y="7" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
  </svg>
);

const DEFAULT_SCHEDULE = [
  { day: 'Mon', enabled: true,  start: '9:00am', end: '12:00pm' },
  { day: 'Tue', enabled: true,  start: '9:00am', end: '5:00pm'  },
  { day: 'Wed', enabled: true,  start: '9:00am', end: '5:00pm'  },
  { day: 'Thu', enabled: true,  start: '9:00am', end: '5:00pm'  },
  { day: 'Fri', enabled: true,  start: '9:00am', end: '5:00pm'  },
  { day: 'Sat', enabled: false, start: '',       end: ''        },
  { day: 'Sun', enabled: false, start: '',       end: ''        },
];

function LocalToggle({ active, onChange }) {
  return (
    <button
      type="button"
      className={`lbd-toggle ${active ? 'lbd-toggle-on' : ''}`}
      onClick={(e) => { e.stopPropagation(); onChange(); }}
    >
      <span className="lbd-toggle-knob" />
    </button>
  );
}

const ACCENT_COLORS = [
  { color: '#0A0A0A', label: 'Black' },
  { color: '#FFFFFF', label: 'White' },
  { color: '#EA4335', label: 'Red' },
  { color: '#F5A623', label: 'Orange' },
  { color: '#34A853', label: 'Green' },
  { color: '#4285F4', label: 'Blue' },
  { color: '#7B1FA2', label: 'Purple' },
];

export const NAV_SECTIONS = [
  { key: 'basics',       label: 'Basics',             subtitle: (slug) => slug, icon: LinkChainIcon },
  { key: 'design',       label: 'Design',             subtitle: () => 'Lobby Customization', icon: PaletteIcon },
  { key: 'availability', label: 'Availability',       subtitle: () => 'Weekdays, 10:00 AM - 4:00 PM', icon: CalIcon },
  { key: 'scheduling',   label: 'Scheduling Settings',subtitle: () => 'Limits, Date Range', icon: ClockIcon },
  { key: 'destination',  label: 'Destination',        subtitle: () => "Host's Office", icon: DoorIcon },
  { key: 'booking-form', label: 'Booking Form',       subtitle: () => 'Invitee Questions', icon: FormIcon },
  { key: 'reminders',    label: 'Reminders',          subtitle: () => 'Email, SMS', icon: BellIcon },
  { key: 'magic-minutes',label: 'Magic Minutes',      subtitle: () => 'Default Template', icon: QuillIcon },
  { key: 'advanced',     label: 'Advanced',           subtitle: () => 'SEO, Booking Emails', icon: MoreIcon },
];

export default function LobbyDetail({ link, onBack, compact = false, activeSection: activeSectionProp, setActiveSection: setActiveSectionProp }) {
  const [activeSectionLocal, setActiveSectionLocal] = useState('design');
  const activeSection = activeSectionProp !== undefined ? activeSectionProp : activeSectionLocal;
  const setActiveSection = setActiveSectionProp || setActiveSectionLocal;
  const [designBg, setDesignBg] = useState(true);
  const [designLogo, setDesignLogo] = useState(true);
  const [designLogoSize, setDesignLogoSize] = useState('L');
  const [designSeal, setDesignSeal] = useState(false);
  const [designBadge, setDesignBadge] = useState(false);
  const [designKnocks, setDesignKnocks] = useState(true);
  const [designWallpaper, setDesignWallpaper] = useState(true);
  const [designTheme, setDesignTheme] = useState('Dark');
  const [designAccent, setDesignAccent] = useState('#4285F4');

  const slugParts = link.slug.split('/');
  const slugEditable = slugParts[slugParts.length - 1];

  return (
    <div className={`lbd-root ${compact ? 'lbd-root-compact' : ''}`}>
      <header className="lbd-header">
        <div className="lbd-header-left">
          <button type="button" className="lbd-back" onClick={onBack} onMouseDown={(e) => e.stopPropagation()}>
            <ArrowLeftIcon />
          </button>
          <span className="lbd-title">{link.name}</span>
        </div>
        <div className="lbd-header-right">
          <span className="lbd-slug">
            <span className="lbd-slug-prefix">ro.am/</span>
            <span className="lbd-slug-editable">{slugEditable}</span>
          </span>
        </div>
      </header>

      <div className="lbd-body">
        {!compact && (
        <aside className="lbd-sidebar">
          {NAV_SECTIONS.map(({ key, label, subtitle, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={`lbd-nav ${activeSection === key ? 'lbd-nav-active' : ''}`}
              onClick={() => setActiveSection(key)}
            >
              <span className="lbd-nav-icon"><Icon /></span>
              <span className="lbd-nav-text">
                <span className="lbd-nav-label">{label}</span>
                <span className="lbd-nav-sub">{subtitle(link.slug)}</span>
              </span>
            </button>
          ))}
        </aside>
        )}

        <div className="lbd-content">
          {activeSection === 'design' ? (
            <>
              <div className="lbd-preview">
                <img src={designBg ? '/lobby/lobby-design-bg.png' : '/lobby/lobby-design-simple.png'} alt="" />
              </div>

              <div className="lbd-panel">
                <DetailRow label="Allow Knocks"><LocalToggle active={designKnocks} onChange={() => setDesignKnocks(!designKnocks)} /></DetailRow>
                <DetailRow label="Background"><LocalToggle active={designBg} onChange={() => setDesignBg(!designBg)} /></DetailRow>
                <DetailRow label="Wallpaper Texture" disabled={!designBg}><LocalToggle active={designWallpaper} onChange={() => setDesignWallpaper(!designWallpaper)} /></DetailRow>
                <DetailRow label="Theme" disabled={!designBg}>
                  <button
                    type="button"
                    className="lbd-theme-btn"
                    onClick={() => setDesignTheme(designTheme === 'Dark' ? 'Light' : 'Dark')}
                  >
                    <span>{designTheme}</span>
                  </button>
                </DetailRow>
                <DetailRow label="Accent Color">
                  <div className="lbd-accent-row">
                    {ACCENT_COLORS.map(({ color, label }) => (
                      <button
                        key={color}
                        type="button"
                        className="lbd-accent-swatch"
                        style={{ background: color, border: (color === '#0A0A0A' || color === '#FFFFFF') ? '1px solid var(--border)' : undefined }}
                        title={label}
                        onClick={() => setDesignAccent(color)}
                      >
                        {designAccent === color && (
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ color: color === '#FFFFFF' ? '#000' : '#fff' }}>
                            <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    ))}
                    <button type="button" className="lbd-accent-swatch lbd-accent-plus">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3.5V12.5M3.5 8H12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    </button>
                  </div>
                </DetailRow>
                <DetailRow label="Add Logo"><LocalToggle active={designLogo} onChange={() => setDesignLogo(!designLogo)} /></DetailRow>
                <DetailRow label="Logo Size">
                  <div className="lbd-size-group">
                    {['S', 'M', 'L'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`lbd-size-btn ${designLogoSize === s ? 'lbd-size-btn-active' : ''}`}
                        onClick={() => setDesignLogoSize(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </DetailRow>
                <DetailRow label="Roam Seal" disabled={!designBg}><LocalToggle active={designSeal} onChange={() => setDesignSeal(!designSeal)} /></DetailRow>
                <DetailRow label="Roamaniac Badge" disabled={!designBg} last><LocalToggle active={designBadge} onChange={() => setDesignBadge(!designBadge)} /></DetailRow>
              </div>
            </>
          ) : activeSection === 'basics' ? (
            <BasicsSection link={link} />
          ) : activeSection === 'availability' ? (
            <AvailabilitySection />
          ) : activeSection === 'scheduling' ? (
            <SchedulingSection />
          ) : activeSection === 'destination' ? (
            <DestinationSection />
          ) : activeSection === 'booking-form' ? (
            <BookingFormSection />
          ) : activeSection === 'reminders' ? (
            <RemindersSection />
          ) : activeSection === 'magic-minutes' ? (
            <MagicMinutesSection />
          ) : activeSection === 'advanced' ? (
            <AdvancedSection />
          ) : (
            <div className="lbd-placeholder">{NAV_SECTIONS.find((s) => s.key === activeSection)?.label} settings coming soon.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, children, disabled = false, last = false }) {
  return (
    <div className={`lbd-row ${disabled ? 'lbd-row-disabled' : ''} ${last ? 'lbd-row-last' : ''}`}>
      <span className="lbd-row-label">{label}</span>
      {children}
    </div>
  );
}

function SectionHeader({ label }) {
  return (
    <div className="lbd-section-header">
      <span>{label}</span>
    </div>
  );
}

function SectionSub({ label }) {
  return <span className="lbd-section-sub">{label}</span>;
}

function Chip({ children }) {
  return <span className="lbd-chip">{children}</span>;
}

function BasicsSection({ link }) {
  const [active, setActive] = useState(link.active);
  return (
    <>
      <div className="lbd-panel">
        <div className="lbd-row">
          <span className="lbd-row-value">{link.name}</span>
        </div>
        <DetailRow label="Active Lobby">
          <LocalToggle active={active} onChange={() => setActive(!active)} />
        </DetailRow>
        <div className="lbd-row lbd-row-slug">
          <span className="lbd-slug-line">
            <span className="lbd-slug-prefix">{link.slug.slice(0, link.slug.length - link.slug.split('/').pop().length)}</span>
            <span className="lbd-slug-editable">{link.slug.split('/').pop()}</span>
          </span>
          <button type="button" className="lbd-hicon"><CopyIcon /></button>
        </div>
        <div className="lbd-row lbd-row-tall">
          <span className="lbd-row-placeholder">Write an overview of the event, including key details for invitees</span>
        </div>
      </div>

      <SectionHeader label="Host" />
      <div className="lbd-panel">
        <div className="lbd-host-row">
          <img src="/headshots/joe-woodward.jpg" alt="" className="lbd-host-avatar-img" />
          <div className="lbd-host-info">
            <span className="lbd-host-name">Joe Woodward (You)</span>
            <span className="lbd-host-email">joe@ro.am</span>
          </div>
        </div>
        <div className="lbd-row lbd-add-row">
          <span className="lbd-row-placeholder">Add Host</span>
        </div>
      </div>
    </>
  );
}

function AvailabilitySection() {
  return (
    <div className="lbd-panel lbd-panel-pad">
      <div className="lbd-host-row lbd-host-row-border">
        <img src="/headshots/howard-lerman.jpg" alt="" className="lbd-host-avatar-img" />
        <div className="lbd-host-info">
          <span className="lbd-host-name">Howard Lerman</span>
          <span className="lbd-host-email">Weekdays, 10:00 AM - 4:00 PM</span>
        </div>
      </div>
      <DetailRow label="Time Zone">
        <button type="button" className="lbd-chev-btn">
          <span>EST · New York</span>
          <span className="lbd-chev-chip"><ChevronDownIcon /></span>
        </button>
      </DetailRow>
      <div className="lbd-schedule-days">
        {DEFAULT_SCHEDULE.map((d) => {
          const [enabled, setEnabled] = useState(d.enabled);
          return (
            <div key={d.day} className="lbd-sched-row">
              <LocalToggle active={enabled} onChange={() => setEnabled(!enabled)} />
              <span className="lbd-sched-day">{d.day}</span>
              {enabled && (
                <>
                  <div className="lbd-sched-time-group">
                    <div className="lbd-sched-time">{d.start || '9:00am'}</div>
                    <span className="lbd-sched-dash"><DashIcon /></span>
                    <div className="lbd-sched-time">{d.end || '5:00pm'}</div>
                  </div>
                  <button type="button" className="lbd-hicon"><XIcon /></button>
                  <button type="button" className="lbd-hicon"><PlusSmIcon /></button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SchedulingSection() {
  return (
    <>
      <SectionHeader label="Scheduling Settings" />
      <SectionSub label="Date Range" />
      <div className="lbd-group">
        <span className="lbd-group-title">Invitees can schedule...</span>
        <div className="lbd-radio-row">
          <div className="lbd-num-chip">60</div>
          <span className="lbd-radio-label">Calendar Days</span>
          <div className="lbd-radio lbd-radio-on"><div /></div>
        </div>
        <div className="lbd-radio-row">
          <span className="lbd-radio-label lbd-radio-indent">Indefinitely into the future</span>
          <div className="lbd-radio" />
        </div>
      </div>

      <div className="lbd-divider" />
      <SectionSub label="Event Limits" />
      <div className="lbd-panel">
        <TwoLineRow title="Buffer Time" sub="15 mins before, 1 hour after">
          <span className="lbd-edit-link">Edit</span>
        </TwoLineRow>
        <TwoLineRow title="Minimum Notice" sub="Set the minimum amount of notice that is required">
          <span className="lbd-row-value">16 Hours</span>
        </TwoLineRow>
        <TwoLineRow title="Daily Limit" sub="Set the maximum events allowed per day">
          <span className="lbd-row-value">2</span>
        </TwoLineRow>
      </div>

      <div className="lbd-divider" />
      <SectionSub label="Additional Options" />
      <div className="lbd-panel">
        <TwoLineRow title="Start Time Increments" sub="Set the frequency of available time slots for invitees">
          <button type="button" className="lbd-chev-btn">
            <span>5 mins</span>
            <span className="lbd-chev-chip"><ChevronDownIcon /></span>
          </button>
        </TwoLineRow>
      </div>
    </>
  );
}

function TwoLine({ title, sub }) {
  return (
    <span className="lbd-twoline">
      <span className="lbd-twoline-title">{title}</span>
      <span className="lbd-twoline-sub">{sub}</span>
    </span>
  );
}

function TwoLineRow({ title, sub, children }) {
  return (
    <div className="lbd-row lbd-row-twoline">
      <TwoLine title={title} sub={sub} />
      {children}
    </div>
  );
}

function DestinationSection() {
  return (
    <div className="lbd-panel">
      <div className="lbd-row lbd-row-muted">
        <span className="lbd-row-label-muted">Destination</span>
        <ChevronUpIcon />
      </div>
      <DetailRow label="Location">
        <div className="lbd-value-chev">
          <span>Host's Office (Audi...</span>
          <span className="lbd-chev-chip"><ChevronUpIcon /></span>
        </div>
      </DetailRow>
      <DetailRow label="Duration" last>
        <div className="lbd-value-chev">
          <span>30 mins</span>
          <span className="lbd-chev-chip"><ChevronUpIcon /></span>
        </div>
      </DetailRow>
    </div>
  );
}

function BookingFormSection() {
  return (
    <>
      <SectionHeader label="Booking Form" />
      <SectionSub label="Invitee Questions" />
      <div className="lbd-panel">
        <BookingField icon={<LockIcon />} title="Name" sub="One Line" />
        <BookingField icon={<LockIcon />} title="Email" sub="Email" />
        <BookingField icon={<DragHandleIcon />} title="Notes" sub="One Line" more />
        <BookingField icon={<DragHandleIcon />} title="Phone Number" sub="Phone Number" more last />
      </div>
      <div className="lbd-add-btn">
        <PlusSmIcon />
        <span>Add New Question</span>
      </div>
    </>
  );
}

function BookingField({ icon, title, sub, more, last }) {
  return (
    <div className={`lbd-booking-field ${last ? 'lbd-row-last' : ''}`}>
      <span className="lbd-booking-icon">{icon}</span>
      <div className="lbd-booking-text">
        <span className="lbd-booking-title">{title}</span>
        <span className="lbd-booking-sub">{sub}</span>
      </div>
      {more && <button type="button" className="lbd-hicon"><MoreIcon /></button>}
    </div>
  );
}

function RemindersSection() {
  return (
    <>
      <SectionHeader label="Reminders" />
      <ReminderCard title="Email Reminders" sub="Send reminder emails to the booker and guests" />
      <ReminderCard title="SMS Reminders" sub="Send reminder texts to the booker" />
    </>
  );
}

function ReminderCard({ title, sub }) {
  const [enabled, setEnabled] = useState(true);
  return (
    <div className="lbd-panel">
      <div className="lbd-reminder-header">
        <div className="lbd-reminder-info">
          <span className="lbd-reminder-title">{title}</span>
          <span className="lbd-reminder-sub">{sub}</span>
        </div>
        <LocalToggle active={enabled} onChange={() => setEnabled(!enabled)} />
      </div>
      <div className="lbd-reminder-row">
        <BellIcon />
        <span className="lbd-reminder-time">1 hour before</span>
        <span className="lbd-chev-chip"><ChevronDownIcon /></span>
      </div>
      <div className="lbd-reminder-row lbd-row-last">
        <BellIcon />
        <span className="lbd-reminder-time lbd-reminder-time-muted">Add Another</span>
        <span className="lbd-chev-chip"><ChevronDownIcon /></span>
      </div>
    </div>
  );
}

function MagicMinutesSection() {
  return (
    <>
      <SectionHeader label="Magic Minutes" />
      <div className="lbd-mm-wrap">
        <div className="lbd-mm-info">
          <span className="lbd-mm-title">Magic Minutes Template</span>
          <span className="lbd-mm-sub">Record Magic Minutes and use the selected summary template.</span>
        </div>
        <button type="button" className="lbd-mm-btn">
          <span>None (Use Default)</span>
          <ChevronDownIcon />
        </button>
      </div>
    </>
  );
}

function AdvancedSection() {
  const [seo, setSeo] = useState(true);
  const [disableBooking, setDisableBooking] = useState(false);
  return (
    <>
      <SectionHeader label="Advanced" />
      <div className="lbd-adv-row">
        <span className="lbd-adv-title">Appear in Search Engines</span>
        <LocalToggle active={seo} onChange={() => setSeo(!seo)} />
      </div>
      <div className="lbd-adv-row">
        <div className="lbd-adv-text">
          <span className="lbd-adv-title">Disable Booking Emails</span>
          <span className="lbd-adv-sub">Prevent sending confirmation, reschedule, and cancellation emails to guests.</span>
        </div>
        <LocalToggle active={disableBooking} onChange={() => setDisableBooking(!disableBooking)} />
      </div>
    </>
  );
}
