export class Text {
  textEl: HTMLElement;

  constructor(
    containerEl: HTMLElement,
    type: keyof Pick<
      HTMLElementTagNameMap,
      'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    >
  ) {
    this.textEl = containerEl.createEl(type);
  }

  public setText(value: string) {
    this.textEl.setText(value);
    return this;
  }

  setAlign(value: string) {
    this.textEl.style.textAlign = value;
    return this;
  }

  public setWarning() {
    this.textEl.style.color = 'var(--text-error)';
    return this;
  }
}
