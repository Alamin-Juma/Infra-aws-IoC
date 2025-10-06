import React, { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import MultiValueInput from "./MultiValueInput";

const AddSpecsModal = ({
    isEditUserModalOpen,
    closeAddUserModal,
    formData,
    handleChange,
    addOptions,
    handleTagsChange,
    apiError,
    selectOptions,
    handleSubmit,
    loading,
    isFormValid  
}) => {
    const cancelButtonRef = useRef(null);

    return (
        <Transition show={isEditUserModalOpen} as={Fragment}>
            <Dialog
                as="div"
                className="fixed inset-0 z-[100]"
                initialFocus={cancelButtonRef}
                onClose={closeAddUserModal}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel
  className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
  style={{ maxWidth: '700px' }}
>
  
  <button
    onClick={closeAddUserModal}
    className="absolute top-1 right-2 text-gray-500 hover:text-gray-700 text-2xl"
    aria-label="Close modal"
  >
    &times;
  </button>

  <div className="bg-gray-2">
    <div className="flex flex-row items-center justify-center mb-3 w-full p-2">
      <h3 className="font-bold text-lg">Add Specification</h3>
    </div>

    <section className="p-2">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">Specification Label</label>
          <input
            placeholder="E.g. RAM"
            id="specName"
            name="specName"
            maxLength={20}
            value={formData.specName}
            onChange={handleChange}
            className="input input-solid max-w-full"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Field Type</label>
          <select
            className="select select-solid max-w-full"
            id="fieldType"
            name="fieldType"
            value={formData.fieldType}
            onChange={handleChange}
          >
            <option value=""></option>
            <option value="text">Text</option>
            <option value="select">Select</option>
          </select>
        </div>

        {addOptions && (
          <div>
            <label className="form-label mb-1">Select Options</label>
            <MultiValueInput
              placeholder="Add option..."
              onChange={handleTagsChange}
              existingTags={selectOptions}
            />
          </div>
        )}

        {apiError.length > 0 && (
          <div className="alert alert-error max-w-full">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 26C22.9 26 22 25.1 22 24V16C22 14.9 22.9 14 24 14C25.1 14 26 14.9 26 16V24C26 25.1 25.1 26 24 26ZM26 34H22V30H26V34Z"
                fill="#E92C2C"
              />
            </svg>
            <div className="flex w-full justify-between">
              <div className="flex flex-col">
                <span className="text-content2">{apiError}</span>
              </div>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.3007 5.71C17.9107 5.32 17.2807 5.32 16.8907 5.71L12.0007 10.59L7.1107 5.7C6.7207 5.31 6.0907 5.31 5.7007 5.7C5.3107 6.09 5.3107 6.72 5.7007 7.11L10.5907 12L5.7007 16.89C5.3107 17.28 5.3107 17.91 5.7007 18.3C6.0907 18.69 6.7207 18.69 7.1107 18.3L12.0007 13.41L16.8907 18.3C17.2807 18.69 17.9107 18.69 18.3007 18.3C18.6907 17.91 18.6907 17.28 18.3007 16.89L13.4107 12L18.3007 7.11C18.6807 6.73 18.6807 6.09 18.3007 5.71Z"
                  fill="#969696"
                />
              </svg>
            </div>
          </div>
        )}

        <div className="mt-4">
          <button
            type="submit"
            className={`rounded-lg btn text-white bg-[#77B634] btn-block ${
              addOptions
                ? !isFormValid() || selectOptions.length < 2
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
                : !isFormValid()
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            disabled={
              !isFormValid() || loading || (addOptions && selectOptions.length === 0)
            }
            onClick={handleSubmit}
          >
            {loading ? <Spinner /> : 'Add Specification'}
          </button>
        </div>
      </form>
    </section>
  </div>
</Dialog.Panel>

                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default AddSpecsModal;
