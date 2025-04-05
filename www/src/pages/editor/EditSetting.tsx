import { Checkbox, Form, Space, Button, Row, Col, Modal } from "antd";
import { observer } from "mobx-react-lite";
import { useStores } from "models";
import { DisplayField } from "models/SettingStore";
interface FormField {
  fields: DisplayField[];
}

export const AddFieldModal: React.FC = observer(() => {
  const { settingStore } = useStores();
  const displayField: { value: DisplayField; label: string }[] = [
    { value: "geology_info", label: "Geology Info" },
    { value: "discover_year", label: "Discover Year" },
    { value: "mineral_form", label: "Mineral Form" },
  ];
  return (
      <Modal title="Add new field" open={settingStore.isModalVisible} onCancel={() => settingStore.hideSetting()} footer={null} width="70%">
        <Form<FormField>
          onFinish={(values) => {
            settingStore.setDisplayColumns(values.fields);
            settingStore.hideSetting();
          }}
        >
          <Form.Item name="fields">
            <Checkbox.Group>
              <Row>
                {displayField.map(({ value, label }) => (
                  <Col span={24} key={value}>
                    <Checkbox key={value} value={value}>
                      {label}
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item style={{ textAlign: "left" }}>
            <Space>
              <Button
                onClick={() => {
                  settingStore.resetFields();
                  settingStore.hideSetting();
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
      </Modal>
  );
});
