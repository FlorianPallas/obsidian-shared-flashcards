export class Fold {
  foldEl: HTMLElement;
  private isExpanded: boolean;

  public constructor(containerEl: HTMLElement) {
    this.foldEl = containerEl.createDiv('settings-fold');
    this.isExpanded = true;
    this.update();
  }

  show() {
    this.isExpanded = true;
    this.update();
  }

  public hide() {
    this.isExpanded = false;
    this.update();
  }

  public toggle() {
    this.isExpanded = !this.isExpanded;
    this.update();
  }

  public setExpanded(value: boolean) {
    this.isExpanded = value;
    this.update();
    return this;
  }

  public getExpanded() {
    return this.isExpanded;
  }

  private update() {
    this.foldEl.style.display = this.isExpanded ? 'block' : 'none';
  }
}
