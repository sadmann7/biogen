import { formatEnum } from "@/utils/format";
import { Listbox, Transition } from "@headlessui/react";
import type { Dispatch, SetStateAction } from "react";
import { Fragment } from "react";
import type { Control, FieldValues, Path, PathValue } from "react-hook-form";
import { Controller } from "react-hook-form";

// external imports
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

type SelectBoxProps<TInputs extends FieldValues, TValue = unknown> = {
  control: Control<TInputs, any>;
  name: Path<TInputs>;
  options: string[];
  selected: TValue;
  setSelected: Dispatch<SetStateAction<TValue>>;
} & JSX.IntrinsicElements["div"];

const SelectBox = <TInputs extends FieldValues, TValue>({
  id,
  control,
  name,
  options,
  selected,
  setSelected,
}: SelectBoxProps<TInputs, TValue>) => {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={selected as PathValue<TInputs, Path<TInputs>>}
      render={({ field: { onChange } }) => (
        <Listbox
          id={id}
          as="div"
          value={selected}
          onChange={(e) => {
            onChange(e);
            setSelected(e);
          }}
        >
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-gray-400 py-2.5 pl-4 pr-10 text-left text-gray-300 shadow-md focus:outline-none focus-visible:border-violet-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-violet-300 sm:text-sm">
              <span className="block truncate">
                {formatEnum(selected as string)}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-md bg-gray-100 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {options.map((option) => (
                  <Listbox.Option
                    key={option}
                    className="relative cursor-pointer select-none py-2 pl-10 pr-4 text-gray-900 ui-selected:bg-violet-300 ui-active:bg-violet-200"
                    value={option}
                  >
                    {({ selected }) => (
                      <>
                        <span className="block truncate font-normal ui-selected:font-medium">
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-900">
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                          {formatEnum(option)}
                        </span>
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      )}
    />
  );
};

export default SelectBox;
