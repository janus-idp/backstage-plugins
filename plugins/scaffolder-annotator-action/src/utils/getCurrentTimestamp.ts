const zeroPad = (d: number) =>
  d < 10 ? '0'.concat(d.toString()) : d.toString();

export const getCurrentTimestamp = (date?: Date) => {
  const dateObj = date || new Date(Date.now());

  const time =
    dateObj.getHours() > 12
      ? `${zeroPad(dateObj.getHours() - 12)}:${zeroPad(
          dateObj.getMinutes(),
        )}:${zeroPad(dateObj.getSeconds())} PM`
      : `${zeroPad(dateObj.getHours())}:${zeroPad(
          dateObj.getMinutes(),
        )}:${zeroPad(dateObj.getSeconds())} AM`;
  return `${dateObj.toLocaleDateString()}, ${time}`;
};
