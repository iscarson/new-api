/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Button } from '@douyinfe/semi-ui';
import { API, showError, copy, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { API_ENDPOINTS } from '../../constants/common.constant';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import {
  IconCode,
  IconFile,
  IconGithubLogo,
  IconHistogram,
  IconPlay,
  IconPriceTag,
} from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import {
  AzureAI,
  Claude,
  Cohere,
  DeepSeek,
  Gemini,
  Grok,
  Hunyuan,
  Midjourney,
  Minimax,
  Moonshot,
  OpenAI,
  Qwen,
  Spark,
  Volcengine,
  Wenxin,
  XAI,
  Xinference,
  Zhipu,
} from '@lobehub/icons';

const visualTabs = [
  { label: '快速接入', icon: <IconCode /> },
  { label: '实时报价', icon: <IconPriceTag /> },
  { label: '用量大盘', icon: <IconHistogram /> },
];

const kpiItems = [
  { value: '30+', label: '覆盖模型' },
  { value: 'OpenAI', label: '兼容接口' },
  { value: '按量', label: '灵活计费' },
];

const modelRows = [
  { short: 'C', name: 'Claude Sonnet', price: '按量计费', color: '#111827' },
  { short: 'O', name: 'GPT 系列', price: '统一接入', color: '#10a37f' },
  { short: 'G', name: 'Gemini 2.5', price: '稳定转发', color: '#1a73e8' },
  { short: 'D', name: 'DeepSeek', price: '高性价比', color: '#252525' },
  { short: 'Q', name: 'Qwen 通义', price: '多模型支持', color: '#615ced' },
  { short: 'K', name: 'Kimi / 豆包', price: '持续扩展', color: '#ee4c4c' },
];

const providerIcons = [
  Moonshot,
  OpenAI,
  XAI,
  Zhipu.Color,
  Volcengine.Color,
  Cohere.Color,
  Claude.Color,
  Gemini.Color,
  Minimax.Color,
  Wenxin.Color,
  Spark.Color,
  DeepSeek.Color,
  Qwen.Color,
  Midjourney,
  Grok,
  AzureAI.Color,
  Hunyuan.Color,
  Xinference.Color,
];

const chartBars = [42, 55, 48, 68, 60, 78, 65, 82, 90, 75, 88, 95];

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [visualIndex, setVisualIndex] = useState(0);
  const [endpointIndex, setEndpointIndex] = useState(0);
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const serverAddress =
    statusState?.status?.server_address || `${window.location.origin}`;
  const endpointItems = useMemo(() => API_ENDPOINTS.slice(0, 4), []);
  const currentEndpoint = endpointItems[endpointIndex] || '/v1/chat/completions';
  const displayedBaseUrl = `${serverAddress}${currentEndpoint}`;
  const isChinese = (i18n.language || '').startsWith('zh');

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);

      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  const handleCopyBaseURL = async () => {
    const ok = await copy(displayedBaseUrl);
    if (ok) {
      showSuccess(t('已复制到剪切板'));
    }
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('获取公告失败:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setEndpointIndex((prev) => (prev + 1) % endpointItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [endpointItems.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisualIndex((prev) => (prev + 1) % visualTabs.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className='w-full overflow-x-hidden'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <main className='jr-home'>
          <section className='jr-hero'>
            <div className='jr-hero-top'>
              <div className='jr-pitch'>
                <div className='jr-eyebrow'>
                  <span className='jr-eyebrow-mark'>AI</span>
                  聚合 30+ 主流模型
                </div>

                <h1
                  className={`jr-title ${isChinese ? 'jr-title-cn' : ''}`}
                >
                  一个接口
                  <br />
                  用上<span>所有大模型</span>
                </h1>

                <p className='jr-desc'>
                  把 base_url 换成当前服务地址，原本写给 OpenAI
                  的代码即可接入 Claude、Gemini、DeepSeek、通义、豆包等模型。
                </p>

                <div className='jr-endpoint'>
                  <code title={displayedBaseUrl}>{serverAddress}</code>
                  <span>{currentEndpoint}</span>
                  <button
                    type='button'
                    className='jr-copy'
                    onClick={handleCopyBaseURL}
                    aria-label='复制接口地址'
                  >
                    <svg
                      aria-hidden='true'
                      className='jr-copy-icon'
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <rect
                        x='8'
                        y='8'
                        width='11'
                        height='11'
                        rx='3'
                        stroke='currentColor'
                        strokeWidth='2'
                      />
                      <path
                        d='M6 16H5C3.9 16 3 15.1 3 14V5C3 3.9 3.9 3 5 3H14C15.1 3 16 3.9 16 5V6'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                      />
                    </svg>
                  </button>
                </div>

                <div className='jr-endpoint-tabs'>
                  {endpointItems.map((endpoint, index) => (
                    <button
                      key={endpoint}
                      type='button'
                      className={`jr-endpoint-tab ${
                        index === endpointIndex ? 'active' : ''
                      }`}
                      onClick={() => setEndpointIndex(index)}
                    >
                      {endpoint.replace('/v1/', '')}
                    </button>
                  ))}
                </div>

                <div className='jr-actions'>
                  <Link to='/console'>
                    <Button
                      theme='solid'
                      type='primary'
                      size={isMobile ? 'default' : 'large'}
                      className='jr-semi-primary'
                      icon={<IconPlay />}
                    >
                      {t('获取密钥')}
                    </Button>
                  </Link>
                  {isDemoSiteMode && statusState?.status?.version ? (
                    <Button
                      size={isMobile ? 'default' : 'large'}
                      className='jr-semi-secondary'
                      icon={<IconGithubLogo />}
                      onClick={() =>
                        window.open(
                          'https://github.com/QuantumNous/new-api',
                          '_blank',
                        )
                      }
                    >
                      {statusState.status.version}
                    </Button>
                  ) : (
                    docsLink && (
                      <Button
                        size={isMobile ? 'default' : 'large'}
                        className='jr-semi-secondary'
                        icon={<IconFile />}
                        onClick={() => window.open(docsLink, '_blank')}
                      >
                        {t('文档')}
                      </Button>
                    )
                  )}
                </div>

                <div className='jr-kpis'>
                  {kpiItems.map((item) => (
                    <div className='jr-kpi' key={item.label}>
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className='jr-visual-wrap'>
                <div className='jr-vis-tabs' role='tablist'>
                  {visualTabs.map((tab, index) => (
                    <button
                      key={tab.label}
                      type='button'
                      className={`jr-vis-tab ${
                        index === visualIndex ? 'active' : ''
                      }`}
                      onClick={() => setVisualIndex(index)}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className='jr-visual'>
                  <div
                    className={`jr-vis ${visualIndex === 0 ? 'active' : ''}`}
                  >
                    <div className='jr-code-card'>
                      <div className='jr-code-bar'>
                        <i />
                        <i />
                        <i />
                        <span>app.py</span>
                      </div>
                      <pre>
                        <span className='jr-comment'>
                          # 一行替换，无需改业务代码
                        </span>
                        {'\n'}
                        <span className='jr-white'>client</span> ={' '}
                        <span className='jr-fn'>OpenAI</span>({'\n'}
                        {'  '}
                        <span className='jr-key'>base_url</span>=
                        <span className='jr-string'>
                          &quot;{serverAddress}/v1&quot;
                        </span>
                        ,{'\n'}
                        {'  '}
                        <span className='jr-key'>api_key</span>=
                        <span className='jr-string'>
                          &quot;jr-sk-***&quot;
                        </span>
                        {'\n'}
                        ){'\n\n'}
                        <span className='jr-white'>resp</span> ={' '}
                        <span className='jr-white'>client</span>
                        .chat.completions.
                        <span className='jr-fn'>create</span>({'\n'}
                        {'  '}
                        <span className='jr-key'>model</span>=
                        <span className='jr-string'>
                          &quot;claude-sonnet&quot;
                        </span>
                        ,{'\n'}
                        {'  '}
                        <span className='jr-key'>messages</span>=[...]{'\n'}
                        )
                      </pre>
                    </div>
                  </div>

                  <div
                    className={`jr-vis ${visualIndex === 1 ? 'active' : ''}`}
                  >
                    <div className='jr-model-card'>
                      <h5>
                        热门模型接入
                        <em>multi-provider</em>
                      </h5>
                      {modelRows.map((model) => (
                        <div className='jr-model-row' key={model.name}>
                          <div
                            className='jr-model-logo'
                            style={{ background: model.color }}
                          >
                            {model.short}
                          </div>
                          <div className='jr-model-name'>{model.name}</div>
                          <div className='jr-model-price'>{model.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className={`jr-vis ${visualIndex === 2 ? 'active' : ''}`}
                  >
                    <div className='jr-dash'>
                      <div className='jr-dash-head'>
                        <div>
                          <h5>用量与稳定性</h5>
                          <strong>可视化管理</strong>
                        </div>
                        <span>实时</span>
                      </div>
                      <div className='jr-dash-chart'>
                        {chartBars.map((height, index) => (
                          <i
                            key={`${height}-${index}`}
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                      <div className='jr-dash-foot'>
                        <span>请求统计</span>
                        <span>模型分布</span>
                      </div>
                      <div className='jr-dash-stats'>
                        <div>
                          <span>成功率</span>
                          <strong>稳定转发</strong>
                        </div>
                        <div>
                          <span>账单</span>
                          <strong>清晰可查</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='jr-provider-section'>
              <div className='jr-provider-label'>支持众多的大模型供应商</div>
              <div className='jr-provider-strip'>
                {providerIcons.map((ProviderIcon, index) => (
                  <div className='jr-provider' key={index}>
                    <ProviderIcon size={34} />
                  </div>
                ))}
                <div className='jr-provider-more'>30+</div>
              </div>
            </div>
          </section>

        </main>
      ) : (
        <div className='overflow-x-hidden w-full'>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className='w-full h-screen border-none'
            />
          ) : (
            <div
              className='mt-[60px]'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
