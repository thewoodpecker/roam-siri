import { offices } from '../data';

/** Cover ids — keep in sync with COVER_DESIGNS in BirthdayCard3D. */
export const COVER_IDS = ['classic', 'script', 'quiet', 'burst', 'sparks', 'balloons', 'cupcakes'];

export function pickExcept(ids, exclude) {
  if (!ids.length) return exclude;
  const pool = ids.filter((id) => id !== exclude);
  const source = pool.length ? pool : ids;
  return source[Math.floor(Math.random() * source.length)];
}

export const CARD_PEOPLE = (() => {
  const rows = offices
    .filter((office) => office.id < 100 && office.people?.[0]?.name)
    .map((office) => {
      const full = office.people[0].name;
      const parts = full.split(/\s+/);
      return {
        id: String(office.id),
        first: parts[0],
        last: parts[parts.length - 1],
        full,
        avatar: office.people[0].avatar,
        officeName: office.name,
      };
    });
  const counts = {};
  rows.forEach((row) => {
    counts[row.first] = (counts[row.first] || 0) + 1;
  });
  return rows
    .map((row) => ({
      ...row,
      label: counts[row.first] > 1 ? `${row.first} ${row.last[0]}.` : row.first,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
})();

export const DEFAULT_PERSON_ID =
  CARD_PEOPLE.find((p) => p.first === 'Klas')?.id ?? CARD_PEOPLE[0]?.id ?? '20';

export function personById(personId) {
  return CARD_PEOPLE.find((p) => p.id === personId) ?? CARD_PEOPLE[0];
}

export function personName(personId) {
  return personById(personId)?.first ?? 'Klas';
}

export const SIGN_CARD_LABEL = 'Sign Birthday Card';
export const SIGN_CARD_TITLE = 'Sign Card';

export function birthdayChipLabel(first) {
  return `${first}'s Birthday`;
}

export const DEFAULT_PALETTE_ID = 'crimson';

export function randomCardLook(exclude = {}, lock = {}) {
  const paletteId = lock.paletteId || DEFAULT_PALETTE_ID;
  const coverId = pickExcept(COVER_IDS, exclude.coverId);
  const backId = 'text';
  const lockedPerson = lock.lockPersonId
    ? personById(lock.lockPersonId)
    : lock.lockName
      ? CARD_PEOPLE.find((p) => p.first === lock.lockName || p.officeName === lock.lockName)
      : null;
  const personId = lockedPerson
    ? lockedPerson.id
    : pickExcept(
      CARD_PEOPLE.map((p) => p.id),
      exclude.personId,
    );
  return {
    paletteId,
    coverId,
    backId,
    personId,
    name: lockedPerson?.first ?? lock.lockName ?? personName(personId),
  };
}
