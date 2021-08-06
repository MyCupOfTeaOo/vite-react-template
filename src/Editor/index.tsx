import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor } from 'tinymce';
import classNames from 'classnames';
import { useValue } from 'teaness';
import { upload } from './UploadAdapter';
import './index.scss';

export interface MyEditorProps {
  value?: string;
  onChange?(value?: string): void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  disabled?: boolean;
}

const MyEditor: React.ForwardRefRenderFunction<any, MyEditorProps> = (
  props,
  ref,
) => {
  const { placeholder, value, className, style, id, onChange } = props;
  const editorRef = useRef<TinyMCEEditor>(null);
  const source = useValue(value);
  const tmp = useRef(value);
  useImperativeHandle(ref, () => editorRef.current, []);
  const myOnChange = React.useCallback(
    (_, e: TinyMCEEditor) => {
      tmp.current = e.getContent();
      onChange?.(e.getContent());
    },
    [onChange],
  );
  useEffect(() => {
    if (tmp.current !== value) {
      source.setValue(value);
    }
  }, [value]);
  return (
    <div id={id} className={classNames('editor', className)} style={style}>
      <Editor
        apiKey="muez1v0qv1973kpud3p1mzk7lb5bmhesq7f0g2tdh3pyd82r"
        onInit={(_, editor) => {
          Object.assign(editorRef, {
            current: editor,
          });
        }}
        disabled={props.disabled}
        onChange={myOnChange}
        initialValue={source.value}
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        init={{
          menubar: false,
          language: 'zh_CN',
          statusbar: false,
          placeholder,
          plugins: [
            'quickbars advlist autoresize autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code table image imagetools ',
          ],
          toolbar:
            'undo redo | ' +
            'alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'image table | ' +
            'removeformat',
          quickbars_insert_toolbar: false,
          quickbars_selection_toolbar:
            'bold italic | superscript subscript | forecolor backcolor | removeformat',
          content_style: `body { font-family: source-han-sans, -apple-system, BlinkMacSystemFont, Segoe UI,
              Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji,
              Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji; }`,
          images_upload_handler: upload,
          paste_data_images: true,
          relative_urls: false,
          remove_script_host: true,
        }}
      />
    </div>
  );
};

export default forwardRef(MyEditor);
