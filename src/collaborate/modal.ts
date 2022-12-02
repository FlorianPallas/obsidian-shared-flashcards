import { App, Modal, Setting } from 'obsidian';

export class ExampleModal extends Modal {
  private identifier?: string;
  private isNew: boolean = false;

  private update = () => {};

  public onOpen() {
    const { contentEl } = this;

    new Setting(contentEl).setName('Collaborate - Setup').setHeading();

    new Setting(contentEl).setName('Identifier').addText((text) =>
      text.setPlaceholder('bob').onChange((value) => {
        this.identifier = value;
        if (value.trim().length < 1) this.identifier = undefined;
        this.update();
      })
    );

    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText('Confirm')
          .setCta()
          .setDisabled(true)
          .onClick(() => {
            this.close();
          })
      )
      .addButton((btn) =>
        btn.setButtonText('Setup Later').onClick(() => {
          this.close();
        })
      );
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}
