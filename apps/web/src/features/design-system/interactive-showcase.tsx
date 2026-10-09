"use client";

import { useState, type ReactNode } from "react";

import { ChoiceGroup, Checkbox, Radio } from "@/components/forms/choice";
import { Field } from "@/components/forms/field";
import { FormSection } from "@/components/forms/form-section";
import { Input } from "@/components/forms/input";
import { Select } from "@/components/forms/select";
import { Textarea } from "@/components/forms/textarea";
import { Button } from "@/components/ui/button";
import { Drawer, Modal } from "@/components/ui/dialog";
import { Tabs } from "@/components/ui/tabs";

import { DsLabel } from "./ds-section";

export function FormsShowcase() {
  return (
    <form className="space-y-12" onSubmit={(event) => event.preventDefault()}>
      <FormSection title="Contact details" description="Field groups pair a short title with the fields they contain.">
        <Field label="Full name" required>
          <Input autoComplete="name" placeholder="Emri Mbiemri" />
        </Field>
        <Field label="Company" optionalLabel="Optional">
          <Input autoComplete="organization" />
        </Field>
        <Field label="Email" required error="Enter a valid email address.">
          <Input type="email" defaultValue="name@" autoComplete="email" />
        </Field>
        <Field label="Phone" description="Include the country code, e.g. +383.">
          <Input type="tel" autoComplete="tel" />
        </Field>
      </FormSection>

      <FormSection title="Project" description="Selects, text areas and choice controls.">
        <Field label="Project type" className="sm:col-span-2">
          <Select defaultValue="">
            <option value="" disabled>
              Select an option
            </option>
            <option>Option A</option>
            <option>Option B</option>
          </Select>
        </Field>
        <Field label="Message" className="sm:col-span-2" description="Dimensions, quantities or anything else we should know.">
          <Textarea />
        </Field>
        <ChoiceGroup legend="Preferred contact method" className="sm:col-span-1">
          <Radio name="contact-method" label="Email" defaultChecked />
          <Radio name="contact-method" label="Phone" />
          <Radio name="contact-method" label="Disabled option" disabled />
        </ChoiceGroup>
        <ChoiceGroup legend="Consent" className="sm:col-span-1">
          <Checkbox label="Send me product updates" description="Occasional emails, unsubscribe any time." />
          <Checkbox label="I accept the privacy policy" defaultChecked />
        </ChoiceGroup>
      </FormSection>

      <div className="flex justify-end gap-3 border-t border-border pt-8">
        <Button variant="secondary">Cancel</Button>
        <Button type="submit" variant="accent">
          Contact us
        </Button>
      </div>
    </form>
  );
}

export function OverlaysShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="space-y-14">
      <div>
        <DsLabel>Tabs</DsLabel>
        <Tabs
          label="Product information"
          items={[
            { id: "overview", label: "Overview", content: <PanelText>Overview panel content.</PanelText> },
            { id: "technical", label: "Technical data", content: <PanelText>Technical data panel content.</PanelText> },
            { id: "application", label: "Application", content: <PanelText>Application panel content.</PanelText> },
            { id: "documents", label: "Documents", content: <PanelText>Documents panel content.</PanelText> },
          ]}
        />
      </div>

      <div>
        <DsLabel>Modal & drawer (native dialog)</DsLabel>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
            Open drawer
          </Button>
        </div>
        <Modal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title="Modal title"
          description="Supporting description for the dialog."
        >
          <div className="space-y-6 px-6 py-6 md:px-8">
            <PanelText>Modal body. Focus is trapped inside; Escape or the backdrop closes it.</PanelText>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)}>Confirm</Button>
            </div>
          </div>
        </Modal>
        <Drawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title="Drawer title"
          description="Used for filters, product quick views and the mobile menu."
        >
          <div className="px-6 py-6 md:px-8">
            <PanelText>Drawer body content.</PanelText>
          </div>
        </Drawer>
      </div>
    </div>
  );
}

function PanelText({ children }: { children: ReactNode }) {
  return <p className="max-w-prose text-body text-text-secondary">{children}</p>;
}
