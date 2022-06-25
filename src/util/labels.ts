export const LABEL_LENGTH = 10;

export const generateLabel = () => {
  let label = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < LABEL_LENGTH; i++) {
    label += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return label;
};

export const createLabel = (labelMap: Map<string, number>) => {
  let label: string;

  do {
    label = generateLabel();
  } while (labelMap.has(label));

  return label;
};
