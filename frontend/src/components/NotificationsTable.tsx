import { Notification, NotificationType } from '@/api/types';
import { Badge, Group, Stack, Text } from '@mantine/core';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import { AtSign, MessageCircle, Smartphone } from 'lucide-react';
import {
   createMRTColumnHelper,
   MantineReactTable,
   useMantineReactTable
} from 'mantine-react-table';

// Ensure consistent parsing across browsers (Safari struggles with "YYYY-MM-DD HH:mm:ss").
// Parse as UTC (seeded timestamps are naive) and display in local time.
dayjs.extend(utc);
dayjs.extend(customParseFormat);

type Props = {
   data: Notification[];
   maxHeight: string; // e.g., `calc(100vh - 168px)`
   isLoading?: boolean;
   enabledTypes: string[];
};

const columnHelper = createMRTColumnHelper<Notification>();

const typeIcon: Record<NotificationType, React.ReactNode> = {
   SMS: <MessageCircle size={16} />,
   EMAIL: <AtSign size={16} />,
   PUSH: <Smartphone size={16} />
};

export function NotificationsTable({
   data,
   maxHeight,
   isLoading,
   enabledTypes
}: Props) {
   const columns = [
      columnHelper.accessor('title', {
         header: 'Name',
         Cell: ({ row }) => (
            <Stack>
               <Text fw={500}>{row.original.title}</Text>
               <Text size='sm' c='dimmed'>
                  {row.original.description}
               </Text>
            </Stack>
         )
      }),
      columnHelper.accessor('type', {
         header: 'Type',
         minSize: 50,
         maxSize: 50,
         Cell: ({ row }) => (
            <Group gap='xs'>
               {typeIcon[row.original.type]}
               <Text size='sm' c='dimmed'>
                  {row.original.type}
               </Text>
            </Group>
         )
      }),
      columnHelper.accessor('createdAt', {
         header: 'Date',
         minSize: 50,
         maxSize: 50,
         Cell: ({ row }) => {
            const date = dayjs
               .utc(row.original.createdAt, 'YYYY-MM-DD HH:mm:ss', true)
               .local();
            return (
               <Text size='sm' c='dimmed'>
                  {date.isValid()
                     ? date.format('MMM D, YYYY, h:mm A')
                     : row.original.createdAt}
               </Text>
            );
         }
      })
   ];

   const table = useMantineReactTable({
      columns,
      data,
      layoutMode: 'grid',
      enableColumnFilters: false,
      mantineTableContainerProps: {
         mah: maxHeight
      },
      mantinePaperProps: { shadow: 'none', withBorder: false, radius: 0 },
      initialState: {
         density: 'xs',
         pagination: { pageSize: 25, pageIndex: 0 }
      },
      enableStickyHeader: true,
      renderTopToolbarCustomActions() {
         return (
            <Group mx={8} mt={4}>
               <Text fw={500}>Showing Types:</Text>
               {enabledTypes.map(type => (
                  <Badge key={type}>{type}</Badge>
               ))}
            </Group>
         );
      },
      state: { isLoading }
   });

   return <MantineReactTable table={table} />;
}
