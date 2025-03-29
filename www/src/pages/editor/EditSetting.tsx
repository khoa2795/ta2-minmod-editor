import { Checkbox, Form, Space, Button } from "antd";
import { useStores } from "models";

export const AddFieldModal: React.FC = () => {
  const { settingStore } = useStores();
  return (
    <Form
      onFinish={(values) => {
        settingStore.setDisplayColumns(values.fields);
        settingStore.hideModal();
      }}
    >
      <Form.Item name="fields">
        <Checkbox.Group style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Checkbox value="geology_info">Geology Info</Checkbox>
          <Checkbox value="discover_year">Discover Year</Checkbox>
          <Checkbox value="mineral_form">Mineral Form</Checkbox>
        </Checkbox.Group>
      </Form.Item>
      <Form.Item style={{ textAlign: "left" }}>
        <Space>
          <Button
            onClick={() => {
              settingStore.resetFields();
              settingStore.hideModal();
            }}
          >
            Reset
          </Button>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
